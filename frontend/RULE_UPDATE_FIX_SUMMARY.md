# Rule Update Fix Summary

## Problem
The user was experiencing a 400 Bad Request error when trying to update rules:
```
PUT http://localhost:8080/api/v1/models/sample-laptop/rules/rule_cpu_memory 400 (Bad Request)
Error: Failed to update rule
```

## Root Cause
The issue was caused by a mismatch between frontend and backend rule type expectations:
- Frontend was sending rule types like: "constraint", "dependency", "exclusion", "requirement"
- Backend expects rule types like: "requires", "excludes", "validation_rule", "mutual_exclusive", "group_limit", "pricing_rule"

## Fixes Implemented

### 1. Rule Type Mapping in RuleEditor.jsx
Added bidirectional mapping functions to convert between frontend and backend rule types:

```javascript
// Map frontend rule types to backend rule types
const mapRuleType = (frontendType) => {
  const typeMap = {
    'constraint': 'validation_rule',
    'dependency': 'requires',
    'exclusion': 'excludes',
    'requirement': 'requires'
  };
  return typeMap[frontendType] || frontendType;
};

// Map backend rule types to frontend rule types
const mapBackendRuleType = (backendType) => {
  const typeMap = {
    'validation_rule': 'constraint',
    'requires': 'dependency',
    'excludes': 'exclusion',
    'mutual_exclusive': 'exclusion',
    'group_limit': 'constraint',
    'pricing_rule': 'constraint'
  };
  return typeMap[backendType] || 'constraint';
};
```

### 2. Form Submission Fix in RuleEditor.jsx
Updated the onSubmit handler to properly map frontend types to backend types:

```javascript
const onSubmit = (data) => {
  const ruleData = {
    id: rule?.id || `rule_${Date.now()}`,
    name: data.name,
    type: mapRuleType(data.type), // Map to backend rule type
    expression: data.expression,
    message: data.description || '',
    is_active: data.isActive,
    priority: data.priority || 50,
  };
  onSave(ruleData);
};
```

### 3. Toggle Rule Mutation Fix in RulesManager.jsx
Fixed the toggleRuleMutation to send complete rule data instead of just the is_active field:

```javascript
const toggleRuleMutation = useMutation({
  mutationFn: ({ rule, is_active }) => {
    const updatedRule = {
      ...rule,
      is_active: is_active
    };
    return modelBuilderApi.updateRule(modelId, rule.id, updatedRule);
  },
  // ...
});
```

Also fixed the button click handler to pass the correct data structure:
```javascript
onClick={() => toggleRuleMutation.mutate({
  rule: rule,
  is_active: rule.is_active === false
})}
```

### 4. Display Type Mapping in RulesManager.jsx
Added backend to frontend type mapping for proper display of existing rules:

```javascript
const mapBackendRuleType = (backendType) => {
  const typeMap = {
    'validation_rule': 'constraint',
    'requires': 'dependency',
    'excludes': 'exclusion',
    'mutual_exclusive': 'exclusion',
    'group_limit': 'constraint',
    'pricing_rule': 'constraint'
  };
  return typeMap[backendType] || backendType;
};
```

### 5. Filter Type Mapping Fix
Updated the filter logic to properly map backend types to frontend types for filtering:

```javascript
const filteredRules = ensureArray(rules).filter(rule => {
  // ...
  const mappedType = mapBackendRuleType(rule.type);
  const matchesType = filterType === 'all' || mappedType === filterType;
  // ...
});
```

### 6. Enhanced Error Logging in api.js
Added better error logging for rule update operations:

```javascript
updateRule: async (modelId, ruleId, ruleData) => {
  try {
    const response = await apiClient.put(`/models/${modelId}/rules/${ruleId}`, ruleData);
    return extractApiData(response.data);
  } catch (error) {
    console.error('Error updating rule:', error.response?.data || error);
    throw error;
  }
},
```

## Backend Handler (model_handlers.go)
The backend UpdateRule handler already properly persists changes to the model, so no changes were needed there.

## Testing
To verify the fixes work:
1. Open an existing rule for editing
2. Make changes and save - should work without 400 error
3. Toggle rule active/inactive status - should work without error
4. Filter rules by type - should properly show rules based on their mapped types
5. Create new rules - should work with proper type mapping

## Key Takeaways
- Always ensure field mappings between frontend and backend are consistent
- When dealing with enums/types, consider creating mapping functions
- Send complete objects for updates rather than partial updates when the backend expects full objects
- Add proper error logging to help diagnose API issues