package com.uber.rides.simulator;

import java.net.URL;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import java.awt.image.BufferedImage;

import javax.imageio.ImageIO;

import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import net.datafaker.Faker;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.json.JsonMapper;

import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.EncodedPolyline;
import com.google.maps.model.LatLng;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.uber.rides.database.DbContext;
import com.uber.rides.model.*;
import com.uber.rides.model.User.Roles;
import com.uber.rides.security.JWT;
import com.uber.rides.service.GoogleMaps;
import com.uber.rides.service.ImageStore;

import static com.uber.rides.util.Utils.*;

@Service
public class DriverSimulator {

    @Autowired DbContext context;
    @Autowired ImageStore images;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired ThreadPoolTaskScheduler scheduler;

    Map<Long, ScheduledFuture<?>> tasks = new ConcurrentHashMap<>();

    static final int BLACK = 0xFF000000;
    static final int WHITE = 0xFFFFFFFF;
    static final int ZOOM = 13;
    static final int WIDTH = 640;
    static final int HEIGHT = 620;

    static final String CALLBACK = "google_dogs";
    static final String CALLBACK_PREFIX = "/**/" + CALLBACK + " && " + CALLBACK + "(";
    /* What are the coordinates of Belgrade, Serbia? */

    public static final LatLng BELGRADE = new LatLng(44.811609, 20.447893);
    /* What are the coordinates of New York, USA? */
    public static final LatLng NEW_YORK = new LatLng(40.762040, -73.980759);

    public static final LatLng NOVI_SAD = new LatLng(45.2671, 19.8335);

    static final LatLng CENTER = NEW_YORK;

    static final Random random = new Random();
    static final ObjectMapper jsonMapper = JsonMapper.builder()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        .configure(DeserializationFeature.READ_ENUMS_USING_TO_STRING, true)
        .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS, true)
        .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
        .propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
        .addMixIn(EncodedPolyline.class, Polyline.class)
        .addMixIn(com.google.maps.model.Duration.class, Duration.class)
        .addMixIn(com.google.maps.model.Distance.class, Distance.class)
        .build();

    long signatureHash;
    LocalDateTime gotHashAt;

    BufferedImage areaOfInterest;

    @Transactional
    public void start(int numberOfDrivers) {
        var drivers = getPresetDrivers(numberOfDrivers);
        this.areaOfInterest = getAreaOfInterest();

        for (int i = 0; i < numberOfDrivers; i++) {
            var driver = drivers.get(i);
            var session = connectToWs(driver);
            if (session != null) runTask(driver, session);
        }
    }

    void runTask(User driver, WebSocketSession session) {
        var coordinates = getRandomCoordinates(this.areaOfInterest, 6);
        var directions = getDirections(coordinates);
        if (directions != null) {
            var points = Stream
            .of(directions.legs)
            .flatMap(leg -> Stream.of(leg.steps).map(s -> s.polyline.decodePath()))
            .flatMap(List::stream)
            .toList();

            var duration = Stream
            .of(directions.legs)
            .mapToLong(leg -> leg.duration.inSeconds)
            .sum();

            var step = (int) (points.size() / (duration / 5.0));
            var filteredPoints = IntStream
                .range(0, points.size())
                .filter(index -> index % step == 0)
                .mapToObj(points::get)
                .toList();
            var pointsIterator = filteredPoints.listIterator();    

            var task = scheduler.scheduleAtFixedRate(
                () -> updateLocation(pointsIterator, driver, session),
                java.time.Duration.ofSeconds(5)
            );
            tasks.put(driver.getId(), task);
        }
    }

    void cancelTask(User driver) {
        var task = tasks.get(driver.getId());
        if (task != null) {
            task.cancel(true);
            tasks.remove(driver.getId());
        }
    }

    void updateLocation(ListIterator<LatLng> pointsIterator, User driver, WebSocketSession session) {
        if (!pointsIterator.hasNext()) {
            cancelTask(driver);
            runTask(driver, session);
            return;
        }
        
        var currentPoint = pointsIterator.next();
        try {
            var message = new TextMessage(
                "UPDATE_LOCATION\n{\"latitude\":" 
                + currentPoint.lat 
                + ",\"longitude\":" 
                + currentPoint.lng 
                + "}"
            );
            session.sendMessage(message);
        } 
        catch (Exception e) { 
            cancelTask(driver);
            runTask(driver, session);
        }
    }

    public WebSocketSession connectToWs(User driver) {
        try {
            var ws = new StandardWebSocketClient();        
            return ws.doHandshake(
                new TextWebSocketHandler(),
                new WebSocketHttpHeaders(),
                new URIBuilder("ws://localhost:8000/ws")
                .addParameter("token", JWT.getJWT(driver))
                .build()
            )
            .get();
        } catch (Exception e) { 
            return null; 
        }
    }

    @Transactional
    public List<User> getPresetDrivers(int numberOfDrivers) {
        var drivers = context.query().stream(User.class)
            .filter(
                User$.role.equal(Roles.DRIVER).and(
                User$.email.startsWith("driver-x"))
            )
            .limit(numberOfDrivers)
            .toList();
            
        var allDrivers = new ArrayList<>(drivers);

        for (int i = 0; i < numberOfDrivers - drivers.size(); i++) {
            var faker = new Faker();
            var name = faker.name();
            var isMale = name.prefix().equals("Mr.") || name.prefix().equals("Dr.");
            var vehicle = faker.vehicle();

            var car = Car
                .builder()
                .type(Car.getAvailableTypes().get(random.nextInt(0, Car.getAvailableTypes().size())))
                .year(faker.random().nextInt(2012, 2022).shortValue())
                .make(vehicle.manufacturer())
                .model(vehicle.model())
                .registration(vehicle.licensePlate().toUpperCase())
                .build();

            context.db().persist(car);
            
            var driver = User
                .builder()
                .role(Roles.DRIVER)
                .firstName(name.firstName())
                .lastName(name.lastName())
                .email("driver-x" + name.username() + "@uber.com")
                .password(passwordEncoder.encode("driver-x-password"))
                .city("New York")
                .phoneNumber(faker.phoneNumber().phoneNumber())
                .emailConfirmed(true)
                .completedRegistration(true)
                .car(car)
                .profilePicture(
                    "https://xsgames.co/randomusers/assets/avatars/" +
                    (isMale ? "male" : "female") + "/" +
                    faker.random().nextInt(10, 75) + ".jpg"
                )
                .build();

            context.db().persist(driver);
            allDrivers.add(driver);
        }

        return allDrivers;
    }

    public BufferedImage getAreaOfInterest() {
        try {
            var style = "style";
            var url = new URIBuilder("https://maps.googleapis.com/maps/api/staticmap")
                .addParameter("size", WIDTH + "x" + WIDTH)
                .addParameter("zoom", ZOOM + "")
                .addParameter("center", CENTER.lat + "," + CENTER.lng)
                .addParameter("key", GoogleMaps.STATIC_KEY)
                .addParameter(style, "feature:landscape|color:0x000000")
                .addParameter(style, "feature:water|visibility:off")
                .addParameter(style, "element:labels|visibility:off")
                .addParameter(style, "feature:transit|visibility:off")
                .addParameter(style, "feature:poi|visibility:off")
                .addParameter(style, "feature:road|color:0xFFFFFF")
                .addParameter(style, "feature:administrative|visibility:off")
                .toString();

            return ImageIO.read(new URL(url)).getSubimage(0, 0, WIDTH, HEIGHT);
        }
        catch (Exception e) { return null; }
    }

    public List<LatLng> getRandomCoordinates(BufferedImage area, int numberOfCoordinates) {
        var coordinates = new ArrayList<LatLng>();
        while (coordinates.size() < numberOfCoordinates) {
            var x = random.nextInt(0, WIDTH);
            var y = random.nextInt(0, HEIGHT);

            var color = area.getRGB(x, y);
            if (color == BLACK) continue; // Pixel is not a road

            var parallelMultiplier = Math.cos(CENTER.lat * Math.PI / 180);
            var degreesPerPixelX = 360 / Math.pow(2, ZOOM + 8.0);
            var degreesPerPixelY = 360 / Math.pow(2, ZOOM + 8.0) * parallelMultiplier;

            coordinates.add(new LatLng(
                CENTER.lat  - degreesPerPixelY * (y - HEIGHT / 2.0),
                CENTER.lng + degreesPerPixelX * (x  - WIDTH / 2.0)
            ));
        }
        return coordinates;
    }

    public DirectionsRoute getDirections(List<LatLng> coordinates) {
        var path = "/maps/api/js/DirectionsService.Route?"
            + buildProtobuf(coordinates)
            + "6e0&12sen&23e1&callback=" + CALLBACK
            + "&key=" + GoogleMaps.STATIC_KEY;

        path = "https://maps.googleapis.com" + path + "&token=" + hashURL(path);

        try (var httpClient = HttpClients.createDefault()) {
            var response = EntityUtils.toString(httpClient.execute(new HttpGet(path)).getEntity());
            var body = response.substring(
                response.indexOf(CALLBACK_PREFIX) + CALLBACK_PREFIX.length(),
                response.length() - 1
            );
            var directions = jsonMapper.readValue(body, DirectionsResult.class);
            return directions.routes[0];
        } 
        catch (Exception e) { return null; }
    }
    
    public String buildProtobuf(List<LatLng> coordinates) {
        var builder = new StringBuilder();
        for (var coordinate : coordinates) {
            builder.append("5m4&1m3&1m2&1d" + coordinate.lat + "&2d" + coordinate.lng + "&");
        }
        return builder.toString();
    }

    public long hashURL(String urlPath) {
        var ramanujan = 1729;
        var mersennePrime6 = 131071;
        var length = urlPath.length();

        refreshSignatureHash();
        var outputHash = this.signatureHash % mersennePrime6;

        for (int i = 0; i < length; i++) {
            outputHash *= ramanujan;
            outputHash += urlPath.charAt(i);
            outputHash %= mersennePrime6;
        }

        return outputHash;
    }

    @SuppressWarnings(UNCHECKED)
    public void refreshSignatureHash() {
        if (gotHashAt != null && gotHashAt.isAfter(LocalDateTime.now().minusMinutes(30))) return;

        try (var httpClient = HttpClients.createDefault()) {
            var body = EntityUtils.toString(httpClient.execute(new HttpGet(
                "https://maps.googleapis.com/maps/api/js?libraries=directions&language=en&key=" + GoogleMaps.STATIC_KEY
            )).getEntity());
            body = body.substring(body.indexOf("apiLoad(") + 8, body.indexOf(", loadScriptTime)"));
            var data = jsonMapper.readValue(body, Object[].class);
            this.signatureHash = ((ArrayList<Long>) data[4]).get(0); // This is where google keeps the current directions hash
            gotHashAt = LocalDateTime.now();
        }
        catch (Exception e) {
            gotHashAt = LocalDateTime.MIN;
        }
    }

}

class Polyline {

    public String points;

    @JsonCreator
    public Polyline(@JsonProperty("points") String points) {
        this.points = points;
    }
}

class Duration {
    
    @JsonProperty("text")
    public String humanReadable;

    @JsonProperty("value")
    public long inSeconds;
    
}

class Distance {

    @JsonProperty("text")
    public String humanReadable;

    @JsonProperty("value")
    public long inMeters;
  
}