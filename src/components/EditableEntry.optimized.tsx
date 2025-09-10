import React, { useState, useCallback, memo } from 'react';
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
import { PhotoUpload } from './PhotoUpload';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'datetime' | 'checkbox' | 'image' | 'photos';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  maxFiles?: number;
}

interface EditableEntryProps {
  entry: any;
  onSave: (updatedEntry: any) => void;
  onDelete: (id: string) => void;
  fields: Field[];
  renderDisplay: (entry: any) => React.ReactNode;
}

// Memoized field components to prevent re-renders
const TextFieldMemo = memo(({ value, onChange, ...props }: any) => (
  <Input
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    size="sm"
    {...props}
  />
));

const NumberFieldMemo = memo(({ value, onChange, min, max, step, ...props }: any) => (
  <NumberInput
    value={value || 0}
    onChange={(_, val) => onChange(val)}
    min={min}
    max={max}
    step={step}
    size="sm"
    {...props}
  >
    <NumberInputField />
    <NumberInputStepper>
      <NumberIncrementStepper />
      <NumberDecrementStepper />
    </NumberInputStepper>
  </NumberInput>
));

const SelectFieldMemo = memo(({ value, onChange, options, ...props }: any) => (
  <Select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    size="sm"
    {...props}
  >
    {options?.map((option: { value: string; label: string }) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </Select>
));

const TextareaFieldMemo = memo(({ value, onChange, ...props }: any) => (
  <Textarea
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    size="sm"
    rows={2}
    {...props}
  />
));

const DateFieldMemo = memo(({ value, onChange, ...props }: any) => (
  <Input
    type="date"
    value={value ? format(new Date(value), 'yyyy-MM-dd') : ''}
    onChange={(e) => onChange(e.target.value)}
    size="sm"
    {...props}
  />
));

const DateTimeFieldMemo = memo(({ value, onChange, ...props }: any) => (
  <Input
    type="datetime-local"
    value={value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : ''}
    onChange={(e) => onChange(e.target.value)}
    size="sm"
    {...props}
  />
));

const CheckboxFieldMemo = memo(({ value, onChange, label, ...props }: any) => (
  <Checkbox
    isChecked={value || false}
    onChange={(e) => onChange(e.target.checked)}
    {...props}
  >
    {label}
  </Checkbox>
));

const ImageFieldMemo = memo(({ value, onChange, ...props }: any) => (
  <Input
    type="url"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Enter image URL"
    size="sm"
    {...props}
  />
));

const PhotosFieldMemo = memo(({ value, onChange, maxFiles, ...props }: any) => (
  <PhotoUpload
    maxFiles={maxFiles || 3}
    existingPhotos={value || []}
    onPhotosChange={onChange}
    {...props}
  />
));

// Field type mapping
const fieldComponents = {
  text: TextFieldMemo,
  number: NumberFieldMemo,
  select: SelectFieldMemo,
  textarea: TextareaFieldMemo,
  date: DateFieldMemo,
  datetime: DateTimeFieldMemo,
  checkbox: CheckboxFieldMemo,
  image: ImageFieldMemo,
  photos: PhotosFieldMemo,
};

TextFieldMemo.displayName = 'TextFieldMemo';
NumberFieldMemo.displayName = 'NumberFieldMemo';
SelectFieldMemo.displayName = 'SelectFieldMemo';
TextareaFieldMemo.displayName = 'TextareaFieldMemo';
DateFieldMemo.displayName = 'DateFieldMemo';
DateTimeFieldMemo.displayName = 'DateTimeFieldMemo';
CheckboxFieldMemo.displayName = 'CheckboxFieldMemo';
ImageFieldMemo.displayName = 'ImageFieldMemo';
PhotosFieldMemo.displayName = 'PhotosFieldMemo';

// Memoized edit form to prevent unnecessary re-renders
const EditForm = memo(({ 
  fields, 
  editedData, 
  setEditedData, 
  onSave, 
  onCancel, 
  borderColor 
}: {
  fields: Field[];
  editedData: any;
  setEditedData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  borderColor: string;
}) => {
  const handleFieldChange = useCallback((key: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [key]: value }));
  }, [setEditedData]);

  const renderEditField = useCallback((field: Field) => {
    const FieldComponent = fieldComponents[field.type];
    const value = editedData[field.key];

    if (!FieldComponent) return null;

    const commonProps = {
      value,
      onChange: (newValue: any) => handleFieldChange(field.key, newValue),
      ...field
    };

    return <FieldComponent {...commonProps} />;
  }, [editedData, handleFieldChange]);

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
          <Button size="sm" colorScheme="green" leftIcon={<FaSave />} onClick={onSave}>
            Save
          </Button>
          <Button size="sm" variant="outline" leftIcon={<FaTimes />} onClick={onCancel}>
            Cancel
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
});

EditForm.displayName = 'EditForm';

// Memoized display component
const DisplayComponent = memo(({ 
  entry, 
  renderDisplay, 
  onEdit, 
  onDelete, 
  borderColor 
}: {
  entry: any;
  renderDisplay: (entry: any) => React.ReactNode;
  onEdit: () => void;
  onDelete: (id: string) => void;
  borderColor: string;
}) => {
  const handleDelete = useCallback(() => {
    onDelete(entry.id);
  }, [entry.id, onDelete]);

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
            onClick={onEdit}
          />
          <IconButton
            icon={<FaTrash />}
            aria-label="Delete entry"
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={handleDelete}
          />
        </HStack>
      </HStack>
    </Box>
  );
});

DisplayComponent.displayName = 'DisplayComponent';

export const EditableEntry: React.FC<EditableEntryProps> = memo(({
  entry,
  onSave,
  onDelete,
  fields,
  renderDisplay,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(entry);
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Memoize callbacks to prevent child re-renders
  const handleSave = useCallback(() => {
    onSave(editedData);
    setIsEditing(false);
  }, [editedData, onSave]);

  const handleCancel = useCallback(() => {
    setEditedData(entry);
    setIsEditing(false);
  }, [entry]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Update edited data when entry changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditedData(entry);
    }
  }, [entry, isEditing]);

  if (isEditing) {
    return (
      <EditForm
        fields={fields}
        editedData={editedData}
        setEditedData={setEditedData}
        onSave={handleSave}
        onCancel={handleCancel}
        borderColor={borderColor}
      />
    );
  }

  return (
    <DisplayComponent
      entry={entry}
      renderDisplay={renderDisplay}
      onEdit={handleEdit}
      onDelete={() => onDelete(entry.id)}
      borderColor={borderColor}
    />
  );
});

EditableEntry.displayName = 'EditableEntry';