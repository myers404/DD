# Enhanced CPQ API Constraint Validation

## Overview

The CPQ API provides detailed constraint validation information to help frontend applications create intelligent, user-friendly configuration interfaces. This document describes the enhanced `AvailableOption` response structure and how to use it effectively.

## AvailableOption Structure

When requesting available options or validating configurations, the API returns an array of `AvailableOption` objects with the following structure:

```json
{
  "option": {
    "id": "opt_cpu_i7",
    "name": "Intel i7 Processor",
    "group_id": "grp_cpu",
    "base_price": 300.00
  },
  "status": "switch",
  "can_select": false,
  "selection_method": "switch",
  "requires_deselect": ["opt_cpu_i5"],
  "blocked_by": [],
  "group_info": {
    "group_id": "grp_cpu",
    "group_type": "select-one",
    "current_selection": ["opt_cpu_i5"],
    "min_selections": 1,
    "max_selections": 1
  },
  "is_selectable": true,        // Legacy field
  "is_required": false,
  "reason": null,
  "impact": "helps",
  "helps_resolve": ["rule_min_performance"]
}
```

## Field Descriptions

### Core Fields

- **`option`**: The option details (id, name, price, etc.)
- **`status`**: Selection status enum indicating how the option can be selected
- **`can_select`**: Boolean indicating if direct selection is possible
- **`selection_method`**: How to select this option ("add", "switch", "none")

### Selection Status Values

- **`selectable`**: Can be added without any changes
- **`switch`**: Can be selected by switching (deselecting another option in single-select groups)
- **`blocked`**: Cannot be selected due to constraint violations
- **`selected`**: Already selected
- **`max-reached`**: Group maximum selections reached

### Constraint Information

- **`requires_deselect`**: Array of option IDs that must be deselected first (for switch operations)
- **`blocked_by`**: Array of constraint violations preventing selection
  ```json
  "blocked_by": [
    {
      "rule_id": "rule_cpu_ram",
      "message": "Intel i7 requires at least 16GB RAM",
      "type": "requires",
      "description": "High-performance CPU requires adequate memory"
    }
  ]
  ```

### Group Context

- **`group_info`**: Information about the option's group
  - `group_id`: Group identifier
  - `group_type`: "select-one", "select-zero-or-one", "multi-select"
  - `current_selection`: Array of currently selected option IDs in this group
  - `min_selections`: Minimum required selections
  - `max_selections`: Maximum allowed selections

### Impact Analysis

- **`impact`**: How selecting this option affects constraint violations
  - `"helps"`: Helps resolve existing violations
  - `"worsens"`: Would create new violations
  - `null`: No impact on constraints
- **`helps_resolve`**: Array of rule IDs that would be satisfied by selecting this option

## Usage Examples

### 1. Handling Single-Select Groups (Radio Buttons)

```javascript
function handleOptionSelection(optionId, availableOptions) {
  const option = availableOptions.find(ao => ao.option.id === optionId);
  
  if (option.status === 'switch') {
    // For single-select groups, deselect the current selection first
    for (const deselectId of option.requires_deselect) {
      removeSelection(deselectId);
    }
    addSelection(optionId);
  } else if (option.status === 'selectable') {
    // Direct selection
    addSelection(optionId);
  } else if (option.status === 'blocked') {
    // Show error with reasons
    const reasons = option.blocked_by.map(b => b.message);
    showError(`Cannot select: ${reasons.join(', ')}`);
  }
}
```

### 2. UI Rendering with Status Indicators

```javascript
function getOptionUIState(availableOption) {
  const { status, impact, helps_resolve, blocked_by } = availableOption;
  
  switch (status) {
    case 'selected':
      return { icon: '✓', cssClass: 'selected', tooltip: 'Currently selected' };
      
    case 'selectable':
      if (impact === 'helps') {
        return { 
          icon: '✅', 
          cssClass: 'helps', 
          tooltip: `Helps resolve: ${helps_resolve.join(', ')}` 
        };
      }
      return { icon: '', cssClass: 'available', tooltip: 'Click to select' };
      
    case 'switch':
      return { 
        icon: '🔄', 
        cssClass: 'switch', 
        tooltip: 'Click to switch selection' 
      };
      
    case 'blocked':
      const reason = blocked_by[0]?.message || 'Constraint violation';
      return { 
        icon: '❌', 
        cssClass: 'blocked', 
        tooltip: reason 
      };
      
    case 'max-reached':
      return { 
        icon: '⚠️', 
        cssClass: 'max-reached', 
        tooltip: 'Maximum selections reached for this group' 
      };
  }
}
```

### 3. Smart Constraint Resolution

```javascript
function suggestResolutions(availableOptions) {
  // Find options that help resolve current violations
  const helpful = availableOptions
    .filter(ao => ao.impact === 'helps' && ao.status !== 'blocked')
    .sort((a, b) => b.helps_resolve.length - a.helps_resolve.length);
    
  if (helpful.length > 0) {
    return {
      message: 'To resolve configuration issues, consider selecting:',
      options: helpful.map(ao => ({
        id: ao.option.id,
        name: ao.option.name,
        resolves: ao.helps_resolve
      }))
    };
  }
  
  return null;
}
```

## Frontend Implementation Guidelines

### 1. Option Display

- Always show selected options, even if they're now blocked
- Use visual indicators (icons, colors) to show option status
- Provide clear tooltips explaining why options are unavailable

### 2. Selection Handling

- Check `status` field before allowing selection
- For `switch` status, handle the deselection automatically
- Show confirmation for switch operations if desired

### 3. Group Constraints

- Use `group_info` to enforce selection limits in the UI
- Show selection count (e.g., "2 of 3 selected")
- Disable options when `max_selections` is reached

### 4. Constraint Feedback

- Display `blocked_by` messages prominently
- Highlight options that `helps_resolve` violations
- Group related constraint violations together

## Example API Response

```json
{
  "available_options": [
    {
      "option": {"id": "opt_cpu_i7", "name": "Intel i7"},
      "status": "selected",
      "can_select": true,
      "selection_method": "none",
      "group_info": {
        "group_id": "grp_cpu",
        "group_type": "select-one",
        "current_selection": ["opt_cpu_i7"]
      }
    },
    {
      "option": {"id": "opt_cpu_i5", "name": "Intel i5"},
      "status": "switch",
      "can_select": false,
      "selection_method": "switch",
      "requires_deselect": ["opt_cpu_i7"],
      "group_info": {
        "group_id": "grp_cpu",
        "group_type": "select-one",
        "current_selection": ["opt_cpu_i7"]
      }
    },
    {
      "option": {"id": "opt_ram_8gb", "name": "8GB RAM"},
      "status": "blocked",
      "can_select": false,
      "selection_method": "none",
      "blocked_by": [
        {
          "rule_id": "rule_cpu_ram",
          "message": "Intel i7 requires at least 16GB RAM",
          "type": "requires"
        }
      ],
      "impact": "worsens"
    },
    {
      "option": {"id": "opt_ram_16gb", "name": "16GB RAM"},
      "status": "selectable",
      "can_select": true,
      "selection_method": "add",
      "impact": "helps",
      "helps_resolve": ["rule_cpu_ram"]
    }
  ]
}
```

## Best Practices

1. **Progressive Enhancement**: Support both new `status` field and legacy `is_selectable` field
2. **Clear Messaging**: Use `blocked_by` messages to explain constraints in user-friendly terms
3. **Visual Hierarchy**: Make helpful options more prominent when violations exist
4. **Responsive Feedback**: Update UI immediately based on selection status
5. **Accessibility**: Ensure status information is available to screen readers