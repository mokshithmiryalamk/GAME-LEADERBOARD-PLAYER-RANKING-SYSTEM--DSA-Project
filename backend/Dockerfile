# Multi-stage build for RANKFORGE Spring Boot backend on Render Free Tier
# Stage 1: Build application JAR using Eclipse Temurin JDK 21 on Alpine
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Copy POM and dependency descriptors first for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build production JAR (tests run in local pipeline, skipped here for fast deployment)
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal runtime image using Eclipse Temurin JRE 21 Alpine
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S rankforge && adduser -S rankforge -G rankforge
USER rankforge

# Copy compiled JAR artifact
COPY --from=builder /workspace/target/rankforge-backend-1.0.0.jar app.jar

# Render dynamic port and production profile defaults
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# Configure JVM for Render 512MB memory boundary with cgroup awareness
ENTRYPOINT ["sh", "-c", "exec java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Dserver.port=${PORT} -Dserver.address=0.0.0.0 -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -jar app.jar"]
