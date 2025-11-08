# Testing Guidelines

## Test Locations

- Component-specific tests should be located in the appropriate feature directory
- Integration tests should be located in the `test/` directory at the root level
- Unit tests can be co-located with the component they test or in the `test/` directory

## Running Tests

To run all tests in the project:
```
npm test
```

To run tests for a specific feature:
```
npm test -- src/features/feature-name/
```