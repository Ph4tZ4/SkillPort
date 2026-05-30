package domain

import "errors"

// Domain-specific sentinel errors used across all layers.
var (
	// ErrNotFound indicates that the requested resource does not exist.
	ErrNotFound = errors.New("resource not found")

	// ErrDuplicate indicates a uniqueness constraint violation (e.g., duplicate email).
	ErrDuplicate = errors.New("resource already exists")

	// ErrValidation indicates invalid input data.
	ErrValidation = errors.New("validation failed")

	// ErrUnauthorized indicates missing or invalid authentication credentials.
	ErrUnauthorized = errors.New("unauthorized")

	// ErrForbidden indicates the user lacks permission for this action.
	ErrForbidden = errors.New("forbidden")

	// ErrInternal indicates an unexpected internal error.
	ErrInternal = errors.New("internal server error")
)

// ValidationError provides structured validation error details.
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrors is a collection of field-level validation errors.
type ValidationErrors struct {
	Errors []ValidationError `json:"errors"`
}

// Error implements the error interface for ValidationErrors.
func (v *ValidationErrors) Error() string {
	if len(v.Errors) == 0 {
		return "validation failed"
	}
	return "validation failed: " + v.Errors[0].Field + " — " + v.Errors[0].Message
}

// APIError represents a structured error response for the API.
type APIError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}
