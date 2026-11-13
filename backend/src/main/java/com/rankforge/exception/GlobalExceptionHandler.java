package com.rankforge.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URI;
import java.time.Instant;

/**
 * Global REST exception handler providing RFC 7807 ProblemDetail compliant responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private ProblemDetail createProblemDetail(HttpStatus status, String title, String detail, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("path", request.getRequestURI());
        problem.setProperty("message", detail); // Backward-compatible field
        return problem;
    }

    @ExceptionHandler(PlayerNotFoundException.class)
    public ResponseEntity<ProblemDetail> handlePlayerNotFound(PlayerNotFoundException ex, HttpServletRequest request) {
        log.warn("Player lookup 404: {}", ex.getMessage());
        ProblemDetail problem = createProblemDetail(HttpStatus.NOT_FOUND, "Player Not Found", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(DuplicatePlayerException.class)
    public ResponseEntity<ProblemDetail> handleDuplicatePlayer(DuplicatePlayerException ex, HttpServletRequest request) {
        log.warn("Duplicate player conflict: {}", ex.getMessage());
        ProblemDetail problem = createProblemDetail(HttpStatus.BAD_REQUEST, "Duplicate Player ID", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(DuplicateQueuePlayerException.class)
    public ResponseEntity<ProblemDetail> handleDuplicateQueuePlayer(DuplicateQueuePlayerException ex, HttpServletRequest request) {
        log.warn("Duplicate queue attempt: {}", ex.getMessage());
        ProblemDetail problem = createProblemDetail(HttpStatus.CONFLICT, "Queue Conflict", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(QueueCapacityExceededException.class)
    public ResponseEntity<ProblemDetail> handleQueueCapacityExceeded(QueueCapacityExceededException ex, HttpServletRequest request) {
        log.warn("Queue capacity exceeded: {}", ex.getMessage());
        ProblemDetail problem = createProblemDetail(HttpStatus.BAD_REQUEST, "Queue Full", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(InsufficientQueuePlayersException.class)
    public ResponseEntity<ProblemDetail> handleInsufficientQueuePlayers(InsufficientQueuePlayersException ex, HttpServletRequest request) {
        log.warn("Insufficient challengers: {}", ex.getMessage());
        ProblemDetail problem = createProblemDetail(HttpStatus.BAD_REQUEST, "Insufficient Queue Challengers", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(NoEligibleMatchException.class)
    public ResponseEntity<ProblemDetail> handleNoEligibleMatch(NoEligibleMatchException ex, HttpServletRequest request) {
        log.warn("No eligible match to undo: {}", ex.getMessage());
        ProblemDetail problem = createProblemDetail(HttpStatus.BAD_REQUEST, "No Eligible Match For Undo", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(PlayerConflictException.class)
    public ResponseEntity<ProblemDetail> handlePlayerConflict(PlayerConflictException ex, HttpServletRequest request) {
        log.warn("Player conflict 409: {}", ex.getMessage());
        ProblemDetail problem = createProblemDetail(HttpStatus.CONFLICT, "Player Deletion Conflict", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");
        ProblemDetail problem = createProblemDetail(HttpStatus.BAD_REQUEST, "Invalid Request Body", msg, request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String msg = String.format("Parameter '%s' must be of type %s.", ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "valid type");
        ProblemDetail problem = createProblemDetail(HttpStatus.BAD_REQUEST, "Parameter Type Mismatch", msg, request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        ProblemDetail problem = createProblemDetail(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        ProblemDetail problem = createProblemDetail(HttpStatus.BAD_REQUEST, "Illegal State", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Internal server error: {}", ex.getMessage(), ex);
        ProblemDetail problem = createProblemDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected server error occurred: " + ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}
