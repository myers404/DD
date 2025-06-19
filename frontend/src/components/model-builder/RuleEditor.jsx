import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CodeBracketIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { ensureArray } from '../../utils/arrayUtils';
import ExpressionEditor from './ExpressionEditor';

// Validation schema
const ruleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  type: z.enum(['constraint', 'dependency', 'exclusion', 'requirement']),
  priority: z.number().min(1).max(100).optional(),
  expression: z.string().min(1, 'Rule expression is required'),
  isActive: z.boolean().default(true),
});

const RuleEditor = ({
  rule = null,
  model,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [showPreview, setShowPreview] = useState(false);

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

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: rule?.name || '',
      description: rule?.message || '', // Use message field from backend as description
      type: rule?.type ? mapBackendRuleType(rule.type) : 'constraint', // Map backend type to frontend type
      priority: rule?.priority || 50,
      expression: rule?.expression || '',
      isActive: rule?.is_active !== false, // Handle snake_case from backend
    },
  });

  const watchedExpression = watch('expression');
  const watchedType = watch('type');

  // Rule type configurations with updated examples using correct syntax
  const ruleTypes = {
    constraint: {
      label: 'Constraint Rule',
      description: 'Defines what combinations are allowed or not allowed',
      color: 'blue',
      examples: ['option_a && option_b', '!(option_c && option_d)', 'option_a || option_b'],
    },
    dependency: {
      label: 'Dependency Rule',
      description: 'Specifies that one option requires another',
      color: 'green',
      examples: ['option_a -> option_b', 'IMPLIES(option_a, option_b)', '(option_a && option_b) -> option_c'],
    },
    exclusion: {
      label: 'Exclusion Rule',
      description: 'Defines mutually exclusive options',
      color: 'red',
      examples: ['XOR(option_a, option_b)', '!(option_a && option_b)', 'option_a != option_b'],
    },
    requirement: {
      label: 'Requirement Rule',
      description: 'Specifies mandatory options under certain conditions',
      color: 'purple',
      examples: ['ITE(condition, option_a, true)', 'condition -> option_a', 'THRESHOLD(sum_options, 1)'],
    },
  };

  // Expression building blocks - updated to correct syntax
  const operators = [
    { label: '&&', value: '&&', description: 'Logical AND - both conditions must be true' },
    { label: '||', value: '||', description: 'Logical OR - either condition can be true' },
    { label: '!', value: '!', description: 'Logical NOT - negates the condition' },
    { label: '->', value: '->', description: 'Implies - if first then second' },
    { label: '<->', value: '<->', description: 'Equivalence - both have same truth value' },
    { label: '==', value: '==', description: 'Equality comparison' },
    { label: '!=', value: '!=', description: 'Inequality comparison' },
    { label: '>', value: '>', description: 'Greater than' },
    { label: '<', value: '<', description: 'Less than' },
  ];

  const functions = [
    { label: 'ITE(cond, then, else)', value: 'ITE(', description: 'If-then-else conditional' },
    { label: 'IMPLIES(a, b)', value: 'IMPLIES(', description: 'Logical implication function' },
    { label: 'EQUIV(a, b)', value: 'EQUIV(', description: 'Logical equivalence function' },
    { label: 'XOR(a, b)', value: 'XOR(', description: 'Exclusive OR function' },
    { label: 'MIN(a, b)', value: 'MIN(', description: 'Minimum of two values' },
    { label: 'MAX(a, b)', value: 'MAX(', description: 'Maximum of two values' },
    { label: 'ABS(x)', value: 'ABS(', description: 'Absolute value' },
    { label: 'THRESHOLD(x, limit)', value: 'THRESHOLD(', description: 'Check if x >= limit' },
  ];

  // Get available options for expression building
  const availableOptions = ensureArray(model?.options);

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

  // Handle form submission
  const onSubmit = (data) => {
    // Transform data to match backend expectations
    // Only include fields that the backend expects
    const ruleData = {
      id: rule?.id || `rule_${Date.now()}`,
      name: data.name,
      type: mapRuleType(data.type), // Map to backend rule type
      expression: data.expression,
      message: data.description || '', // Use description as message
      is_active: data.isActive,
      priority: data.priority || 50,
    };

    onSave(ruleData);
  };

  // Add option to expression
  const addToExpression = (text) => {
    const currentExpression = watchedExpression || '';
    const newExpression = currentExpression ? `${currentExpression} ${text}` : text;
    setValue('expression', newExpression);
  };

  // Insert operator
  const insertOperator = (operator) => {
    addToExpression(operator);
  };

  // Insert option
  const insertOption = (option) => {
    addToExpression(option.id);
  };

  // Expression validation state
  const [expressionValidation, setExpressionValidation] = useState({ isValid: true, errors: [] });

  // Handle expression validation result from ExpressionEditor
  const handleExpressionValidation = useCallback((validationResult) => {
    setExpressionValidation(prev => {
      const newValidation = {
        isValid: validationResult?.success === true,
        errors: validationResult?.errors || []
      };
      
      // Only update if validation actually changed
      if (prev.isValid !== newValidation.isValid || 
          JSON.stringify(prev.errors) !== JSON.stringify(newValidation.errors)) {
        return newValidation;
      }
      return prev;
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {rule ? 'Edit Rule' : 'Create New Rule'}
          </h2>
          <p className="text-gray-600 mt-1">
            Define constraints and dependencies for your model
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Rule Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                {/* Rule Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name
                  </label>
                  <input
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter rule name..."
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what this rule does..."
                  />
                </div>

                {/* Rule Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Type
                  </label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(ruleTypes).map(([type, config]) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => field.onChange(type)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              field.value === type
                                ? `border-${config.color}-500 bg-${config.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-sm">{config.label}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {config.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority (1-100)
                  </label>
                  <input
                    {...register('priority', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher numbers = higher priority
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Rule is active
                        </span>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Expression Builder */}
          <div className="space-y-6">
            {/* Expression Builder */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Expression Builder
              </h3>

              {/* Quick Insert Buttons */}
              <div className="space-y-4">
                {/* Operators */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Operators</h4>
                  <div className="flex flex-wrap gap-2">
                    {operators.map((op) => (
                      <button
                        key={op.value}
                        type="button"
                        onClick={() => insertOperator(op.value)}
                        className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                        title={op.description}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Functions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Functions</h4>
                  <div className="flex flex-wrap gap-2">
                    {functions.map((func) => (
                      <button
                        key={func.value}
                        type="button"
                        onClick={() => insertOperator(func.value)}
                        className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200"
                        title={func.description}
                      >
                        {func.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Available Options ({availableOptions.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    <div className="space-y-1">
                      {ensureArray(availableOptions).map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => insertOption(option)}
                          className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded flex items-center justify-between"
                        >
                          <span>{option.name}</span>
                          <span className="text-gray-500">{option.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Examples */}
                {ruleTypes[watchedType] && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Examples</h4>
                    <div className="space-y-1">
                      {ruleTypes[watchedType].examples.map((example, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setValue('expression', example)}
                          className="block w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded font-mono"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expression Editor */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rule Expression</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expression
              </label>
              <ExpressionEditor
                value={watchedExpression || ''}
                onChange={(newValue) => setValue('expression', newValue)}
                onValidationChange={handleExpressionValidation}
                variables={availableOptions.reduce((acc, opt) => ({ ...acc, [opt.id]: true }), {})}
                placeholder="Enter your rule expression using backend syntax..."
                showValidation={true}
                showVariables={false}
                showWarnings={true}
                height="200px"
                className="border border-gray-300 rounded-lg focus-within:ring-blue-500 focus-within:border-blue-500"
              />
            </div>

            {/* Syntax Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">Supported Syntax:</div>
                  <div className="space-y-1 text-xs">
                    <div><strong>Logical:</strong> {`&& (AND), || (OR), ! (NOT), -> (IMPLIES), <-> (EQUIV)`}</div>
                    <div><strong>Comparison:</strong> {`==, !=, <, <=, >, >=`}</div>
                    <div><strong>Arithmetic:</strong> +, -, *, /, %</div>
                    <div><strong>Functions:</strong> ITE(cond, then, else), IMPLIES(a, b), XOR(a, b), ABS(x), MIN/MAX(a, b)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && watchedExpression && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rule Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {watch('name') || 'Untitled Rule'}</div>
                <div><strong>Type:</strong> {ruleTypes[watchedType]?.label}</div>
                <div><strong>Priority:</strong> {watch('priority')}</div>
                <div><strong>Status:</strong> {watch('isActive') ? 'Active' : 'Inactive'}</div>
                <div><strong>Expression:</strong></div>
                <div className="font-mono text-xs bg-white p-2 rounded border">
                  {watchedExpression}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isLoading || !expressionValidation.isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : rule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RuleEditor;
