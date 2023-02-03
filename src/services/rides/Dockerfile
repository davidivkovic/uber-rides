FROM eclipse-temurin:19-jdk-alpine as base
WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:resolve
COPY src ./src

FROM base as build
RUN ./mvnw package -Dmaven.test.skip

FROM eclipse-temurin:19-jre-alpine as production
EXPOSE 8000
COPY --from=build /app/target/rides-*.jar /rides.jar
CMD ["java", "-jar", "/rides.jar"]