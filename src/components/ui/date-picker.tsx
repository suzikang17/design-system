import React, { useState, useEffect } from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultYear?: number; // For birthday vs future date defaults
  minDate?: Date; // Disable dates before this date
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value = "",
  onChange,
  placeholder = "Select date...",
  disabled = false,
  className = "",
  defaultYear = 1990,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() => {
    // Convert ISO date to MM/dd/yyyy for consistent display
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      try {
        const [year, month, day] = value.split('-').map(Number);
        const dateVal = new Date(year, month - 1, day);
        if (isValid(dateVal)) {
          return format(dateVal, 'MM/dd/yyyy');
        }
      } catch (e) {
        // Fall back to original value if parsing fails
      }
    }
    return value;
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!value) return undefined;
    
    // Try parsing the current value with timezone-safe parsing
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day); // Month is 0-indexed
    }
    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      return parse(value, 'MM/dd/yyyy', new Date());
    }
    
    return undefined;
  });

  // Update inputValue and selectedDate when value prop changes
  useEffect(() => {
    if (!value) {
      setInputValue('');
      setSelectedDate(undefined);
      return;
    }

    // Convert ISO date to MM/dd/yyyy for consistent display
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      try {
        const [year, month, day] = value.split('-').map(Number);
        const dateVal = new Date(year, month - 1, day);
        if (isValid(dateVal)) {
          setInputValue(format(dateVal, 'MM/dd/yyyy'));
          setSelectedDate(dateVal);
          return;
        }
      } catch (e) {
        // Fall back to original value if parsing fails
      }
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      const parsedDate = parse(value, 'MM/dd/yyyy', new Date());
      if (isValid(parsedDate)) {
        setInputValue(value);
        setSelectedDate(parsedDate);
        return;
      }
    }

    // If we can't parse the value, just set it as-is
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    
    // Try to parse and validate the date
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(newValue)) {
      const parsedDate = parse(newValue, 'MM/dd/yyyy', new Date());
      if (isValid(parsedDate)) {
        setSelectedDate(parsedDate);
        // Convert to YYYY-MM-DD for storage
        const year = parsedDate.getFullYear();
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
        const day = parsedDate.getDate().toString().padStart(2, '0');
        onChange?.(`${year}-${month}-${day}`);
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const formatted = format(date, 'MM/dd/yyyy');
      setInputValue(formatted);
      setIsOpen(false);
      
      // Convert to YYYY-MM-DD for storage
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      onChange?.(`${year}-${month}-${day}`);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="px-3 transition-colors"
            type="button"
            disabled={disabled}
            title="Open calendar to select date"
            aria-label="Open calendar to select date"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div>
            {/* Custom Month/Year Navigation */}
            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <Select
                  value={(selectedDate?.getMonth() ?? new Date().getMonth()).toString()}
                  onValueChange={(month) => {
                    const currentDate = selectedDate || new Date();
                    const newDate = new Date(currentDate.getFullYear(), parseInt(month), 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <SelectTrigger className="w-24 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {format(new Date(2000, i, 1), 'MMM')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={(selectedDate?.getFullYear() ?? new Date().getFullYear()).toString()}
                  onValueChange={(year) => {
                    const currentDate = selectedDate || new Date();
                    const newDate = new Date(parseInt(year), currentDate.getMonth(), 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <SelectTrigger className="w-20 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 2050 - 1920 + 1 }, (_, i) => {
                      const year = 2050 - i; // Start from 2050 and go down to 1920
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today);
                }}
              >
                Today
              </Button>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={selectedDate || new Date()}
              onMonthChange={setSelectedDate}
              className="p-3 pt-0"
              disabled={minDate ? { before: minDate } : undefined}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
