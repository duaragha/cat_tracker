import React, { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Input,
  Select,
  Textarea,
  Button,
  Badge,
  useColorModeValue,
  FormControl,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { FaEdit, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';

interface EditableEntryProps {
  entry: any;
  onSave: (updatedEntry: any) => void;
  onDelete: (id: string) => void;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'datetime' | 'checkbox';
    options?: Array<{ value: string; label: string }>;
    min?: number;
    max?: number;
    step?: number;
  }>;
  renderDisplay: (entry: any) => React.ReactNode;
}

export const EditableEntry: React.FC<EditableEntryProps> = ({
  entry,
  onSave,
  onDelete,
  fields,
  renderDisplay,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(entry);
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(entry);
    setIsEditing(false);
  };

  const renderEditField = (field: any) => {
    const value = editedData[field.key];

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => setEditedData({ ...editedData, [field.key]: e.target.value })}
            size="sm"
          />
        );
      
      case 'number':
        return (
          <NumberInput
            value={value || 0}
            onChange={(_, val) => setEditedData({ ...editedData, [field.key]: val })}
            min={field.min}
            max={field.max}
            step={field.step}
            size="sm"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        );
      
      case 'select':
        return (
          <Select
            value={value || ''}
            onChange={(e) => setEditedData({ ...editedData, [field.key]: e.target.value })}
            size="sm"
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => setEditedData({ ...editedData, [field.key]: e.target.value })}
            size="sm"
            rows={2}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value ? format(new Date(value), 'yyyy-MM-dd') : ''}
            onChange={(e) => setEditedData({ ...editedData, [field.key]: e.target.value })}
            size="sm"
          />
        );
      
      case 'datetime':
        return (
          <Input
            type="datetime-local"
            value={value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) => setEditedData({ ...editedData, [field.key]: e.target.value })}
            size="sm"
          />
        );
      
      case 'checkbox':
        return (
          <Checkbox
            isChecked={value || false}
            onChange={(e) => setEditedData({ ...editedData, [field.key]: e.target.checked })}
          >
            {field.label}
          </Checkbox>
        );
      
      default:
        return null;
    }
  };

  if (isEditing) {
    return (
      <Box p={3} borderWidth={1} borderColor={borderColor} borderRadius="md">
        <VStack spacing={3} align="stretch">
          {fields.map((field) => (
            <FormControl key={field.key}>
              {field.type !== 'checkbox' && (
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  {field.label}
                </Text>
              )}
              {renderEditField(field)}
            </FormControl>
          ))}
          <HStack justify="flex-end" spacing={2}>
            <Button size="sm" colorScheme="green" leftIcon={<FaSave />} onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" leftIcon={<FaTimes />} onClick={handleCancel}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={3} borderWidth={1} borderColor={borderColor} borderRadius="md">
      <HStack justify="space-between">
        {renderDisplay(entry)}
        <HStack spacing={1}>
          <IconButton
            icon={<FaEdit />}
            aria-label="Edit entry"
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={() => setIsEditing(true)}
          />
          <IconButton
            icon={<FaTrash />}
            aria-label="Delete entry"
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => onDelete(entry.id)}
          />
        </HStack>
      </HStack>
    </Box>
  );
};