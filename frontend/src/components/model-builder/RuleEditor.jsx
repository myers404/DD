import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CodeBracketIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

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
  const [expressionBuilder, setExpressionBuilder] = useState([]);

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
      description: rule?.description || '',
      type: rule?.type || 'constraint',
      priority: rule?.priority || 50,
      expression: rule?.expression || '',
      isActive: rule?.isActive !== false,
    },
  });

  const watchedExpression = watch('expression');
  const watchedType = watch('type');

  // Rule type configurations
  const ruleTypes = {
    constraint: {
      label: 'Constraint Rule',
      description: 'Defines what combinations are allowed or not allowed',
      color: 'blue',
      examples: ['option_a AND option_b', 'NOT (option_c AND option_d)'],
    },
    dependency: {
      label: 'Dependency Rule',
      description: 'Specifies that one option requires another',
      color: 'green',
      examples: ['option_a REQUIRES option_b', 'option_c -> option_d'],
    },
    exclusion: {
      label: 'Exclusion Rule',
      description: 'Defines mutually exclusive options',
      color: 'red',
      examples: ['option_a EXCLUDES option_b', 'option_c XOR option_d'],
    },
    requirement: {
      label: 'Requirement Rule',
      description: 'Specifies mandatory options under certain conditions',
      color: 'purple',
      examples: ['IF option_a THEN REQUIRED option_b', 'option_c => MUST option_d'],
    },
  };

  // Expression building blocks
  const operators = [
    { label: 'AND', value: 'AND', description: 'Both conditions must be true' },
    { label: 'OR', value: 'OR', description: 'Either condition can be true' },
    { label: 'NOT', value: 'NOT', description: 'Negates the condition' },
    { label: 'REQUIRES', value: 'REQUIRES', description: 'First option requires second' },
    { label: 'EXCLUDES', value: 'EXCLUDES', description: 'Options are mutually exclusive' },
    { label: 'IF...THEN', value: 'IF...THEN', description: 'Conditional requirement' },
  ];

  // Get available options for expression building
  const availableOptions = model?.options || [];

  // Handle form submission
  const onSubmit = (data) => {
    const ruleData = {
      ...data,
      id: rule?.id || `rule_${Date.now()}`,
      modelId: model?.id,
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

  // Validate expression syntax
  const validateExpression = (expression) => {
    if (!expression) return { isValid: false, errors: ['Expression is required'] };
    
    const errors = [];
    
    // Basic syntax validation
    const hasBalancedParentheses = (str) => {
      let count = 0;
      for (let char of str) {
        if (char === '(') count++;
        if (char === ')') count--;
        if (count < 0) return false;
      }
      return count === 0;
    };

    if (!hasBalancedParentheses(expression)) {
      errors.push('Unbalanced parentheses');
    }

    // Check for valid option references
    const tokens = expression.split(/\s+/);
    const validOperators = ['AND', 'OR', 'NOT', 'REQUIRES', 'EXCLUDES', 'IF', 'THEN', '(', ')'];
    
    tokens.forEach(token => {
      if (!validOperators.includes(token) && !availableOptions.some(opt => opt.id === token)) {
        if (token !== '') {
          errors.push(`Unknown option or operator: ${token}`);
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const expressionValidation = validateExpression(watchedExpression);

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

                {/* Available Options */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Available Options ({availableOptions.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    <div className="space-y-1">
                      {availableOptions.map((option) => (
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

        {/* Expression Input */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rule Expression</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expression
              </label>
              <textarea
                {...register('expression')}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-blue-500 focus:border-blue-500 ${
                  expressionValidation.isValid ? 'border-gray-300' : 'border-red-300'
                }`}
                placeholder="Enter your rule expression..."
              />
            </div>

            {/* Validation Results */}
            {watchedExpression && (
              <div className={`p-3 rounded-lg ${
                expressionValidation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {expressionValidation.isValid ? (
                    <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XMarkIcon className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${
                    expressionValidation.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {expressionValidation.isValid ? 'Expression is valid' : 'Expression has errors'}
                  </span>
                </div>
                
                {!expressionValidation.isValid && expressionValidation.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {expressionValidation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
