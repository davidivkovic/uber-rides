package com.uber.rides.util;

public class GeoUtils {

    public static double distance(double latA, double lonA, double latB, double lonB) {
        double theta = lonA - lonB;
        double dist = 
            Math.sin(Math.toRadians(latA)) * 
            Math.sin(Math.toRadians(latB)) + 
            Math.cos(Math.toRadians(latA)) * 
            Math.cos(Math.toRadians(latB)) * 
            Math.cos(Math.toRadians(theta));
        dist = Math.acos(dist);
        dist = Math.toDegrees(dist);
        return dist * 1.609344 * 1000;        
    }

}
