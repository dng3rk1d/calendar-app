import React, { useState, useEffect, useRef } from 'react';

// The main calendar component with all requested features
const EventCalendar = () => {
  // State for calendar control
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [currentView, setCurrentView] = useState('month'); // 'month', 'week', or 'day'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [templates, setTemplates] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const fileInputRef = useRef(null);
  
  // State for event form
  const [eventTitle, setEventTitle] = useState('');
  const [eventColor, setEventColor] = useState('#3498db');
  const [multipleOccurrences, setMultipleOccurrences] = useState(false);
  const [occurrences, setOccurrences] = useState([{ date: '', startTime: '', duration: '' }]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFacilitator, setEventFacilitator] = useState('');
  const [eventRoom, setEventRoom] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [eventCapacity, setEventCapacity] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  
  // State for template form
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Load events from localStorage on initial render
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    
    const savedTemplates = localStorage.getItem('eventTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);
  
  // Save templates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('eventTemplates', JSON.stringify(templates));
  }, [templates]);

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Day names for display
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Get the current week's dates
  const getWeekDates = () => {
    const date = new Date(year, month, selectedDate.getDate());
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      weekDates.push(newDate);
    }
    
    return weekDates;
  };

  // Add a new occurrence field
  const addOccurrence = () => {
    setOccurrences([...occurrences, { date: '', startTime: '', duration: '' }]);
  };

  // Update occurrence field
  const updateOccurrence = (index, field, value) => {
    const updatedOccurrences = [...occurrences];
    updatedOccurrences[index][field] = value;
    setOccurrences(updatedOccurrences);
  };

  // Remove occurrence field
  const removeOccurrence = (index) => {
    if (occurrences.length > 1) {
      const updatedOccurrences = occurrences.filter((_, i) => i !== index);
      setOccurrences(updatedOccurrences);
    }
  };
  
  // Generate recurring event dates
  const generateRecurringDates = () => {
    const startDate = new Date(occurrences[0].date);
    const endDate = new Date(recurrenceEndDate);
    const dates = [];
    
    // Add the first date
    dates.push({
      date: occurrences[0].date,
      startTime: occurrences[0].startTime,
      duration: occurrences[0].duration
    });
    
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      if (recurrencePattern === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurrencePattern === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (recurrencePattern === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (recurrencePattern === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      if (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        dates.push({
          date: dateString,
          startTime: occurrences[0].startTime,
          duration: occurrences[0].duration
        });
      }
    }
    
    return dates;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If editing an existing event
    if (editingEvent) {
      updateEvent();
      return;
    }
    
    // Prepare occurrence data based on form state
    let eventOccurrences = [];
    
    if (isRecurring && occurrences[0].date && recurrenceEndDate) {
      // Generate recurring dates
      eventOccurrences = generateRecurringDates();
    } else if (multipleOccurrences) {
      // Use manually entered multiple occurrences
      eventOccurrences = occurrences;
    } else {
      // Single occurrence
      eventOccurrences = [occurrences[0]];
    }
    
    // Create new events
    const newEvents = eventOccurrences.map(occ => ({
      id: Date.now() + Math.random(),
      title: eventTitle,
      color: eventColor,
      date: occ.date,
      startTime: occ.startTime,
      duration: occ.duration,
      facilitator: eventFacilitator,
      room: eventRoom,
      notes: eventNotes,
      capacity: eventCapacity
    }));
    
    // Update state with new events
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents, ...newEvents];
      return updatedEvents;
    });
    
    // Reset form after successful submission
    resetForm();
  };

  // Reset form after submission
  const resetForm = () => {
    setEventTitle('');
    setEventColor('#3498db');
    setMultipleOccurrences(false);
    setOccurrences([{ date: '', startTime: '', duration: '' }]);
    setShowEventForm(false);
    setEditingEvent(null);
    setEventFacilitator('');
    setEventRoom('');
    setEventNotes('');
    setEventCapacity('');
    setIsRecurring(false);
    setRecurrencePattern('weekly');
    setRecurrenceEndDate('');
    setSelectedTemplate('');
  };
  
  // Start editing an event
  const startEditEvent = (event) => {
    setEditingEvent(event.id);
    setEventTitle(event.title);
    setEventColor(event.color);
    setMultipleOccurrences(false);
    setOccurrences([{ 
      date: event.date, 
      startTime: event.startTime, 
      duration: event.duration 
    }]);
    setEventFacilitator(event.facilitator || '');
    setEventRoom(event.room || '');
    setEventNotes(event.notes || '');
    setEventCapacity(event.capacity || '');
    setShowEventForm(true);
  };
  
  // Update an existing event
  const updateEvent = () => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === editingEvent 
          ? {
              ...event,
              title: eventTitle,
              color: eventColor,
              date: occurrences[0].date,
              startTime: occurrences[0].startTime,
              duration: occurrences[0].duration,
              facilitator: eventFacilitator,
              room: eventRoom,
              notes: eventNotes,
              capacity: eventCapacity
            }
          : event
      )
    );
    resetForm();
  };
  
  // Delete an event
  const deleteEvent = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== editingEvent)
      );
      resetForm();
    }
  };
  
  // Save event as template
  const saveTemplate = () => {
    const newTemplate = {
      id: Date.now(),
      name: templateName || eventTitle,
      title: eventTitle,
      color: eventColor,
      duration: occurrences[0].duration,
      facilitator: eventFacilitator,
      room: eventRoom,
      notes: eventNotes,
      capacity: eventCapacity
    };
    
    setTemplates([...templates, newTemplate]);
    setShowTemplateForm(false);
    alert('Template saved successfully!');
  };
  
  // Apply selected template to current form
  const applyTemplate = () => {
    const template = templates.find(t => t.id.toString() === selectedTemplate);
    if (template) {
      setEventTitle(template.title);
      setEventColor(template.color);
      
      // Only update duration in occurrences
      setOccurrences(occurrences.map(occ => ({
        ...occ,
        duration: template.duration
      })));
      
      setEventFacilitator(template.facilitator || '');
      setEventRoom(template.room || '');
      setEventNotes(template.notes || '');
      setEventCapacity(template.capacity || '');
    }
  };
  
  // Export calendar events to JSON file
  const exportCalendar = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `calendar-events-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Import calendar events from JSON file
  const importCalendar = () => {
    fileInputRef.current.click();
  };
  
  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedEvents = JSON.parse(event.target.result);
        if (Array.isArray(importedEvents)) {
          if (window.confirm(`Import ${importedEvents.length} events? This will replace your current calendar.`)) {
            setEvents(importedEvents);
          }
        } else {
          alert('Invalid file format. Please select a valid calendar export file.');
        }
      } catch (error) {
        alert('Error importing calendar: ' + error.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = null;
  };

  // Go to previous month
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  // Go to next month
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };
  
  // Go to previous week
  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
    setMonth(newDate.getMonth());
    setYear(newDate.getFullYear());
  };
  
  // Go to next week
  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
    setMonth(newDate.getMonth());
    setYear(newDate.getFullYear());
  };
  
  // Go to previous day
  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
    setMonth(newDate.getMonth());
    setYear(newDate.getFullYear());
  };
  
  // Go to next day
  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
    setMonth(newDate.getMonth());
    setYear(newDate.getFullYear());
  };

  // Get events for a specific day
  const getEventsForDay = (year, month, day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === formattedDate);
  };
  
  // Get events for a specific date object
  const getEventsForDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return events.filter(event => event.date === formattedDate);
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    
    if (hour === 0) {
      return `12:${minutes} AM`;
    } else if (hour < 12) {
      return `${hour}:${minutes} AM`;
    } else if (hour === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hour - 12}:${minutes} PM`;
    }
  };

  // Format duration for display
  const formatDuration = (duration) => {
    if (!duration) return '';
    return `${duration} hr${duration !== '1' ? 's' : ''}`;
  };
  
  // Open print view in new window
  const openPrintView = () => {
    const printWindow = window.open('', '_blank');
    const currentViewName = currentView === 'month' ? 'Month' : (currentView === 'week' ? 'Week' : 'Day');
    const formattedDate = currentView === 'month' 
      ? `${monthNames[month]} ${year}`
      : (currentView === 'week' 
        ? `Week of ${getWeekDates()[0].toLocaleDateString()} - ${getWeekDates()[6].toLocaleDateString()}`
        : `${selectedDate.toLocaleDateString()}`);
    
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Calendar Print View - ${formattedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f2f2f2; padding: 8px; border: 1px solid #ddd; }
          td { border: 1px solid #ddd; padding: 8px; vertical-align: top; height: 100px; }
          .event { margin-bottom: 8px; padding: 5px; border-radius: 4px; color: white; }
          .event-title { font-weight: bold; }
          .event-time { font-size: 0.8em; }
          .event-details { font-size: 0.8em; }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Calendar - ${formattedDate} (${currentViewName} View)</h1>
        <div style="text-align: center; margin-bottom: 20px;">
          <button onclick="window.print()">Print</button>
        </div>
    `;
    
    if (currentView === 'month') {
      printContent += `
        <table>
          <tr>
            <th>Sunday</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
          </tr>
      `;
      
      const daysInMonth = getDaysInMonth(year, month);
      const firstDayOfMonth = getFirstDayOfMonth(year, month);
      let dayCount = 1;
      
      // Calendar rows
      for (let i = 0; i < 6; i++) {
        printContent += '<tr>';
        
        // Calendar cells
        for (let j = 0; j < 7; j++) {
          if ((i === 0 && j < firstDayOfMonth) || dayCount > daysInMonth) {
            printContent += '<td></td>';
          } else {
            const dayEvents = getEventsForDay(year, month, dayCount);
            
            printContent += `
              <td>
                <div style="font-weight: bold;">${dayCount}</div>
                ${dayEvents.map(event => `
                  <div class="event" style="background-color: ${event.color};">
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">
                      ${formatTime(event.startTime)}
                      ${event.duration ? ` (${formatDuration(event.duration)})` : ''}
                    </div>
                    ${event.facilitator ? `<div class="event-details">Facilitator: ${event.facilitator}</div>` : ''}
                    ${event.room ? `<div class="event-details">Room: ${event.room}</div>` : ''}
                  </div>
                `).join('')}
              </td>
            `;
            
            dayCount++;
          }
        }
        
        printContent += '</tr>';
        
        // Stop rendering rows if we've gone through all days
        if (dayCount > daysInMonth) break;
      }
      
      printContent += '</table>';
    } else if (currentView === 'week') {
      const weekDates = getWeekDates();
      
      printContent += `
        <table>
          <tr>
            <th>Time</th>
            ${weekDates.map(date => `<th>${dayNames[date.getDay()]} ${date.getMonth() + 1}/${date.getDate()}</th>`).join('')}
          </tr>
      `;
      
      // Create time slots from 7 AM to 9 PM
      for (let hour = 7; hour <= 21; hour++) {
        const timeString = hour < 12 
          ? `${hour}:00 AM` 
          : (hour === 12 ? `12:00 PM` : `${hour - 12}:00 PM`);
        
        printContent += `
          <tr>
            <td>${timeString}</td>
        `;
        
        for (let day = 0; day < 7; day++) {
          const date = weekDates[day];
          const dayEvents = getEventsForDate(date).filter(event => {
            const eventHour = parseInt(event.startTime.split(':')[0], 10);
            return eventHour === hour;
          });
          
          printContent += `
            <td>
              ${dayEvents.map(event => `
                <div class="event" style="background-color: ${event.color};">
                  <div class="event-title">${event.title}</div>
                  <div class="event-time">
                    ${formatTime(event.startTime)}
                    ${event.duration ? ` (${formatDuration(event.duration)})` : ''}
                  </div>
                  ${event.facilitator ? `<div class="event-details">Facilitator: ${event.facilitator}</div>` : ''}
                  ${event.room ? `<div class="event-details">Room: ${event.room}</div>` : ''}
                </div>
              `).join('')}
            </td>
          `;
        }
        
        printContent += '</tr>';
      }
      
      printContent += '</table>';
    } else {
      // Day view
      const dayEvents = getEventsForDate(selectedDate);
      
      printContent += `
        <h2>${dayNames[selectedDate.getDay()]}, ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}</h2>
        <table>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Details</th>
          </tr>
      `;
      
      // Sort events by start time
      const sortedEvents = [...dayEvents].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
      
      for (const event of sortedEvents) {
        printContent += `
          <tr>
            <td>${formatTime(event.startTime)}<br>${event.duration ? `(${formatDuration(event.duration)})` : ''}</td>
            <td>
              <div style="background-color: ${event.color}; color: white; padding: 5px; border-radius: 4px;">
                ${event.title}
              </div>
            </td>
            <td>
              ${event.facilitator ? `<div><strong>Facilitator:</strong> ${event.facilitator}</div>` : ''}
              ${event.room ? `<div><strong>Room:</strong> ${event.room}</div>` : ''}
              ${event.capacity ? `<div><strong>Capacity:</strong> ${event.capacity}</div>` : ''}
              ${event.notes ? `<div><strong>Notes:</strong> ${event.notes}</div>` : ''}
            </td>
          </tr>
        `;
      }
      
      printContent += '</table>';
    }
    
    printContent += `
        </body>
        </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Render month view calendar grid
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 border border-gray-200"></div>);
    }

    // Add cells for each day in month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(year, month, day);
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === month && 
                      new Date().getFullYear() === year;
      
      days.push(
        <div 
          key={day} 
          className={`min-h-36 bg-white border border-gray-200 p-2 overflow-y-auto ${isToday ? 'bg-blue-50' : ''}`}
          onClick={() => {
            setSelectedDate(new Date(year, month, day));
            setCurrentView('day');
          }}
        >
          <div className={`font-bold text-sm mb-2 ${isToday ? 'text-blue-600' : ''}`}>{day}</div>
          {dayEvents.map(event => (
            <div 
              key={event.id} 
              className="mb-2 p-2 text-sm rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
              style={{ backgroundColor: event.color, color: '#ffffff' }}
              onClick={(e) => {
                e.stopPropagation();
                startEditEvent(event);
              }}
              title="Click to edit"
            >
              <div className="font-semibold">{event.title}</div>
              <div className="text-xs mt-1">
                {formatTime(event.startTime)} 
                {event.duration && ` (${formatDuration(event.duration)})`}
              </div>
              {event.facilitator && (
                <div className="text-xs mt-1">
                  {event.facilitator}
                </div>
              )}
              {event.room && (
                <div className="text-xs">
                  Room: {event.room}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-px bg-gray-200" style={{ minHeight: "700px" }}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 bg-gray-100 text-center font-bold">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days}
        </div>
      </div>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const weekDates = getWeekDates();
    
    return (
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border w-20 bg-gray-100"></th>
              {weekDates.map((date, index) => {
                const isToday = new Date().getDate() === date.getDate() && 
                              new Date().getMonth() === date.getMonth() && 
                              new Date().getFullYear() === date.getFullYear();
                
                return (
                  <th 
                    key={index} 
                    className={`p-2 border text-center ${isToday ? 'bg-blue-50' : 'bg-gray-100'}`}
                    onClick={() => {
                      setSelectedDate(new Date(date));
                      setCurrentView('day');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`font-bold ${isToday ? 'text-blue-600' : ''}`}>
                      {dayNames[date.getDay()].substring(0, 3)}
                    </div>
                    <div className={isToday ? 'text-blue-600' : ''}>
                      {date.getMonth() + 1}/{date.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Create time slots from 7 AM to 9 PM */}
            {Array.from({ length: 15 }, (_, i) => i + 7).map(hour => {
              const timeString = hour < 12 
                ? `${hour}:00 AM` 
                : (hour === 12 ? `12:00 PM` : `${hour - 12}:00 PM`);
              
              return (
                <tr key={hour} className="border">
                  <td className="p-2 border text-center bg-gray-50 font-medium">
                    {timeString}
                  </td>
                  {weekDates.map((date, dayIndex) => {
                    const dayEvents = getEventsForDate(date).filter(event => {
                      const eventHour = parseInt(event.startTime.split(':')[0], 10);
                      return eventHour === hour;
                    });
                    
                    return (
                      <td key={dayIndex} className="p-1 border min-h-20 relative">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id} 
                            className="mb-1 p-1 text-xs rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: event.color, color: '#ffffff' }}
                            onClick={() => startEditEvent(event)}
                          >
                            <div className="font-semibold">{event.title}</div>
                            <div>
                              {formatTime(event.startTime)} 
                              {event.duration && ` (${formatDuration(event.duration)})`}
                            </div>
                            {event.facilitator && <div>{event.facilitator}</div>}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    // Sort events by start time
    const sortedEvents = [...dayEvents].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    
    return (
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">
          {dayNames[selectedDate.getDay()]}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
        </h2>
        
        <div className="bg-white border rounded-lg overflow-hidden">
          {sortedEvents.length > 0 ? (
            <div className="divide-y">
              {sortedEvents.map(event => (
                <div 
                  key={event.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => startEditEvent(event)}
                >
                  <div className="flex items-start">
                    <div 
                      className="w-4 h-full rounded-full mr-4 mt-1" 
                      style={{ backgroundColor: event.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="font-bold text-lg">{event.title}</div>
                        <div className="text-gray-600">
                          {formatTime(event.startTime)} 
                          {event.duration && ` (${formatDuration(event.duration)})`}
                        </div>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {event.facilitator && (
                          <div>
                            <span className="font-medium">Facilitator:</span> {event.facilitator}
                          </div>
                        )}
                        {event.room && (
                          <div>
                            <span className="font-medium">Room:</span> {event.room}
                          </div>
                        )}
                        {event.capacity && (
                          <div>
                            <span className="font-medium">Capacity:</span> {event.capacity}
                          </div>
                        )}
                      </div>
                      
                      {event.notes && (
                        <div className="mt-2 text-sm text-gray-700 border-t border-gray-100 pt-2">
                          <div className="font-medium">Notes:</div>
                          <p>{event.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No events scheduled for this day. Click "Add Event" to schedule something.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Event Calendar Generator</h1>
      
      {/* Hidden file input for import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        accept=".json" 
        className="hidden" 
      />
      
      {/* Calendar Controls */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            {currentView === 'month' && (
              <>
                <button 
                  onClick={prevMonth} 
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  &lt;
                </button>
                
                <div className="flex space-x-2">
                  <select 
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="border rounded p-1"
                  >
                    {monthNames.map((name, index) => (
                      <option key={index} value={index}>{name}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="border rounded p-1"
                  >
                    {Array.from({ length: 10 }, (_, i) => year - 5 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={nextMonth} 
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  &gt;
                </button>
              </>
            )}
            
            {currentView === 'week' && (
              <>
                <button 
                  onClick={prevWeek} 
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  &lt;
                </button>
                
                <span className="font-medium">
                  Week of {getWeekDates()[0].toLocaleDateString()} - {getWeekDates()[6].toLocaleDateString()}
                </span>
                
                <button 
                  onClick={nextWeek} 
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  &gt;
                </button>
              </>
            )}
            
            {currentView === 'day' && (
              <>
                <button 
                  onClick={prevDay} 
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  &lt;
                </button>
                
                <span className="font-medium">
                  {selectedDate.toLocaleDateString()}
                </span>
                
                <button 
                  onClick={nextDay} 
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  &gt;
                </button>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowEventForm(!showEventForm)} 
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showEventForm ? 'Cancel' : 'Add Event'}
            </button>
            
            <button
              onClick={exportCalendar}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              title="Export calendar events to a file"
            >
              Export
            </button>
            
            <button
              onClick={importCalendar}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              title="Import calendar events from a file"
            >
              Import
            </button>
            
            <button
              onClick={openPrintView}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              title="Open print-friendly view"
            >
              Print View
            </button>
          </div>
        </div>
        
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${currentView === 'month' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setCurrentView('month')}
          >
            Month
          </button>
          <button
            className={`px-4 py-2 font-medium ${currentView === 'week' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setCurrentView('week')}
          >
            Week
          </button>
          <button
            className={`px-4 py-2 font-medium ${currentView === 'day' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setCurrentView('day')}
          >
            Day
          </button>
        </div>
      </div>
      
      {/* Template Management */}
      {templates.length > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-4">
          <h3 className="font-medium mb-2">Session Templates</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="border rounded p-2 flex-1"
            >
              <option value="">Select a template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            <button
              onClick={applyTemplate}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={!selectedTemplate}
            >
              Apply Template
            </button>
          </div>
        </div>
      )}
      
      {/* Event Form */}
      {showEventForm && (
        <div className="mb-4 p-4 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-bold mb-2">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Name/Group</label>
                <input 
                  type="text" 
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input 
                  type="color" 
                  value={eventColor}
                  onChange={(e) => setEventColor(e.target.value)}
                  className="w-full p-1 border rounded h-10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Facilitator</label>
                <input 
                  type="text" 
                  value={eventFacilitator}
                  onChange={(e) => setEventFacilitator(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Who is leading this session?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Room/Location</label>
                <input 
                  type="text" 
                  value={eventRoom}
                  onChange={(e) => setEventRoom(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Where is this session held?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input 
                  type="number" 
                  value={eventCapacity}
                  onChange={(e) => setEventCapacity(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Maximum participants"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Additional information"
                  rows="1"
                />
              </div>
            </div>
            
            {/* Recurrence Options */}
            <div className="mb-4">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={isRecurring}
                    onChange={() => {
                      setIsRecurring(!isRecurring);
                      if (!isRecurring) {
                        setMultipleOccurrences(false);
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Recurring Event</span>
                </label>
                
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={multipleOccurrences}
                    onChange={() => {
                      setMultipleOccurrences(!multipleOccurrences);
                      if (!multipleOccurrences) {
                        setIsRecurring(false);
                      }
                    }}
                    className="mr-2"
                  />
                  <span>Multiple Occurrences</span>
                </label>
              </div>
              
              {isRecurring && (
                <div className="mt-3 p-3 border rounded bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Recurrence Pattern</label>
                      <select
                        value={recurrencePattern}
                        onChange={(e) => setRecurrencePattern(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">End Date</label>
                      <input 
                        type="date" 
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                        className="w-full p-2 border rounded"
                        required={isRecurring}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {(isRecurring || !multipleOccurrences) && (
                <div className="p-3 border rounded bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">First/Only Occurrence</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input 
                        type="date" 
                        value={occurrences[0].date}
                        onChange={(e) => updateOccurrence(0, 'date', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time</label>
                      <input 
                        type="time" 
                        value={occurrences[0].startTime}
                        onChange={(e) => updateOccurrence(0, 'startTime', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                      <input 
                        type="number" 
                        min="0.5"
                        step="0.5"
                        value={occurrences[0].duration}
                        onChange={(e) => updateOccurrence(0, 'duration', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {multipleOccurrences && !isRecurring && occurrences.map((occ, index) => (
                <div key={index} className="p-3 border rounded bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Occurrence {index + 1}</h3>
                    {index > 0 && (
                      <button 
                        type="button"
                        onClick={() => removeOccurrence(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input 
                        type="date" 
                        value={occ.date}
                        onChange={(e) => updateOccurrence(index, 'date', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time</label>
                      <input 
                        type="time" 
                        value={occ.startTime}
                        onChange={(e) => updateOccurrence(index, 'startTime', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                      <input 
                        type="number" 
                        min="0.5"
                        step="0.5"
                        value={occ.duration}
                        onChange={(e) => updateOccurrence(index, 'duration', e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {multipleOccurrences && !isRecurring && (
                <button 
                  type="button"
                  onClick={addOccurrence}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  + Add Another Occurrence
                </button>
              )}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              {/* Template save option */}
              {!editingEvent && (
                <div>
                  {showTemplateForm ? (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="text"
                        placeholder="Template name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="p-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={saveTemplate}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTemplateForm(false)}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTemplateForm(true)}
                      className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Save as Template
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex space-x-2">
                {editingEvent && (
                  <button 
                    type="button"
                    onClick={deleteEvent}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {editingEvent ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Calendar Views */}
      {currentView === 'month' && renderMonthView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'day' && renderDayView()}
      
      {/* Instructions for editing */}
      {events.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
          <p>Tip: Click on any event in the calendar to edit or delete it.</p>
        </div>
      )}
    </div>
  );
}

export default EventCalendar;