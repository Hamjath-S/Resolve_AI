# Application Troubleshooting

## Application HTTP 500 Error

An HTTP 500 error generally indicates a server-side application failure.

Possible causes:
- Application exception
- Deployment issue
- Missing environment variable
- Database failure
- Dependency failure
- Configuration error

Troubleshooting:

1. Check application logs.
2. Review recent deployment changes.
3. Verify environment variables.
4. Check database connectivity.
5. Verify application dependencies.
6. Roll back the deployment if the failure is confirmed to have been introduced by the deployment.