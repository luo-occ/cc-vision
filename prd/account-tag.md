# Account Tags Feature PRD

## Problem Statement

The current account type system is overly rigid and limiting:

- **Fixed Options**: Only 3 hardcoded account types (Securities, Cash, Crypto)
- **User Limitations**: Cannot create custom categorizations like "Retirement", "Emergency Fund", "Kids Education"
- **Underutilized**: Account types don't drive business logic, mainly used for UI display
- **Poor UX**: Forces users into predefined buckets that don't match their financial organization

## Solution: User-Defined Account Tags

Replace the rigid account type system with flexible user-defined tags that allow:
- Multiple tags per account
- Custom tag creation
- Better financial organization
- More powerful filtering and reporting

## Goals

1. **User Experience**: Enable users to categorize accounts in ways meaningful to them
2. **Flexibility**: Support unlimited custom tags instead of predefined types
3. **Power**: Allow multiple tags per account for granular categorization
4. **Migration**: Smooth transition from existing account types
5. **Performance**: Maintain fast query performance with tag-based filtering

## Technical Requirements

### Database Schema Changes

#### Current Schema
```sql
accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_type TEXT DEFAULT 'SECURITIES', -- REMOVE THIS
  -- ... other fields
)
```

#### New Schema
```sql
accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  -- account_type field removed
  -- ... other fields
)

account_tags (
  account_id TEXT REFERENCES accounts(id),
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id, tag_name)
)
```

### API Changes

#### New Endpoints
- `GET /api/tags` - Get all available tags
- `POST /api/accounts/:id/tags` - Add tag to account
- `DELETE /api/accounts/:id/tags/:tag` - Remove tag from account
- `GET /api/accounts?tags=retirement,401k` - Filter accounts by tags

#### Modified Endpoints
- `POST /api/accounts` - Accept tags instead of account_type
- `PUT /api/accounts/:id` - Update tags instead of account_type
- `GET /api/accounts` - Return tags instead of account_type

### Frontend Changes

#### Components to Update
1. **Account Creation/Edit Form**: Replace type dropdown with tag input
2. **Account Selector**: Update to use tags for grouping/filtering
3. **Account List**: Display tags instead of account type
4. **Tag Management**: Add tag creation and management UI

#### New Components
1. **TagInput**: Multi-select tag input component
2. **TagBadge**: Display component for account tags
3. **TagFilter**: Filter accounts by selected tags

## Migration Strategy

### Phase 1: Parallel Implementation
1. Add `account_tags` table alongside existing `account_type`
2. Migrate existing account types as default tags
3. Update UI to show both account type and tags
4. Allow users to add additional tags

### Phase 2: Transition Period
1. Make tags the primary categorization method
2. Update all features to use tags instead of account types
3. Add migration tools to convert legacy data
4. Provide user guidance about the change

### Phase 3: Deprecate Account Types
1. Remove account type from UI
2. Remove account_type field from database
3. Clean up legacy code and constants
4. Update documentation

## User Experience Flow

### Creating an Account
1. User enters account name and other details
2. Instead of selecting account type, user adds tags:
   - Type to create new tags
   - Select from existing popular tags
   - Add multiple tags as needed
3. Example tags: "Retirement", "401k", "Employer", "Taxable"

### Managing Account Tags
1. Edit account to modify tags
2. Add/remove tags as needed
3. See accounts grouped by tags in dashboard
4. Filter holdings and performance by account tags

## Success Metrics

1. **Adoption Rate**: % of accounts using custom tags vs default tags
2. **Tag Diversity**: Average number of tags per account
3. **User Satisfaction**: Feedback on new system vs old account types
4. **Feature Usage**: Usage of tag-based filtering and reporting

## Risks and Mitigations

### Risk 1: Performance Impact
- **Mitigation**: Proper indexing on account_tags table
- **Mitigation**: Efficient tag querying strategies

### Risk 2: User Confusion
- **Mitigation**: Clear migration guidance and tooltips
- **Mitigation**: Maintain backward compatibility during transition

### Risk 3: Data Migration Issues
- **Mitigation**: Comprehensive migration scripts
- **Mitigation**: Rollback capability and data validation

## Future Enhancements

1. **Tag Analytics**: Reporting based on tag groups
2. **Tag Suggestions**: AI-powered tag recommendations
3. **Tag Colors**: Visual customization for tags
4. **Tag Hierarchies**: Parent-child tag relationships
5. **Tag Sharing**: Share tag templates between users

## Conclusion

Replacing rigid account types with flexible user-defined tags will significantly improve the user experience and provide more powerful financial organization capabilities. The implementation is straightforward with minimal risk and high user value.