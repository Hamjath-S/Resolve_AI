# Authentication Troubleshooting

## Login Failure

Common causes:
- Invalid credentials
- Authentication service unavailable
- Incorrect environment configuration
- Database connectivity problems
- Expired authentication tokens

## Troubleshooting Steps

1. Verify that the user credentials are correct.
2. Check whether the authentication service is running.
3. Verify authentication-related environment variables.
4. Check backend logs for authentication errors.
5. Verify database connectivity.
6. Check whether recent deployments changed authentication configuration.

## HTTP 500 During Login

An HTTP 500 error indicates a server-side failure.

Possible causes include:
- Backend exception
- Database connection failure
- Incorrect deployment configuration
- Missing environment variable
- Authentication service failure

Recommended action:
Check backend application logs and verify the authentication and database configuration.