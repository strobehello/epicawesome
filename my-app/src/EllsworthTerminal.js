import React, { useState, useEffect, useRef } from 'react';

const FalloutTerminal = () => {
  const [messagesData, setMessagesData] = useState([]);
  const [terminalLines, setTerminalLines] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const terminalRef = useRef();
  const inputRef = useRef();
  const initRef = useRef(false);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => setCursor(prev => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Load messages - keeps duplicating will this work
  useEffect(() => {
    if (initRef.current) return; // Already initialized
    initRef.current = true;
    
    const loadMessages = async () => {
      try {
        const response = await fetch('/user_messages.json');
        const data = await response.json();
        const messages = data.messages || data;
        setMessagesData(messages);
        
        // Clear any existing lines first
        setTerminalLines([]);
        
        // Initial login sequence
        const loginSequence = [
          { text: 'ELLSWORTH INDUSTRIES (TM) TERMLINK PROTOCOL', delay: 100, type: 'header' },
          { text: 'ENTER PASSWORD NOW', delay: 500, type: 'header' },
          { text: '', delay: 200, type: 'normal' },
          { text: '3 ATTEMPT(S) LEFT: ■■■', delay: 300, type: 'warning' },
          { text: '', delay: 200, type: 'normal' }
        ];

        let totalDelay = 800;
        loginSequence.forEach((item, index) => {
          setTimeout(() => {
            setTerminalLines(prev => [...prev, { text: item.text, type: item.type, id: `login-${index}` }]);
            if (index === loginSequence.length - 1) {
              setIsLoading(false);
            }
          }, totalDelay);
          totalDelay += item.delay;
        });
        
      } catch (error) {
        setTerminalLines([{ text: 'ERROR: COMMUNICATION DATABASE UNAVAILABLE', type: 'error', id: 'error-1' }]);
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, []);

  const addLine = (text, type = 'normal') => {
    const newId = `line-${Date.now()}-${Math.random()}`;
    setTerminalLines(prev => [...prev, { text, type, id: newId }]);
  };

  const parseDate = (dateStr) => {
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
    ];
    
    if (formats[0].test(dateStr)) {
      return dateStr;
    } else if (formats[1].test(dateStr)) {
      const [mm, dd, yyyy] = dateStr.split('-');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    } else if (formats[2].test(dateStr)) {
      const [mm, dd, yyyy] = dateStr.split('/');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    return null;
  };

  const handleCommand = (command) => {
    const cmd = command.trim().toUpperCase();
    addLine(`>${command}`, 'input');
    
    if (cmd === 'HELP') {
      addLine('', 'normal');
      addLine('ELLSWORTH INDUSTRIES (TM) TERMLINK PROTOCOL', 'header');
      addLine('COMMUNICATION LOG ACCESS COMMANDS', 'header');
      addLine('', 'normal');
      addLine('>HELP                       SHOW AVAILABLE COMMANDS', 'menu');
      addLine('>DATE [YYYY-MM-DD]          VIEW MESSAGES FROM DATE', 'menu');
      addLine('>STATUS                     SYSTEM INFORMATION', 'menu');
      addLine('>CLEAR                      CLEAR TERMINAL', 'menu');
      addLine('', 'normal');
      addLine('EXAMPLE: >DATE 2024-06-05', 'menu');
      addLine('', 'normal');
    } else if (cmd === 'CLEAR') {
      setTerminalLines([]);
    } else if (cmd === 'STATUS') {
      const totalMessages = messagesData.length;
      const channels = [...new Set(messagesData.map(m => m.channel))].filter(Boolean);
      const servers = [...new Set(messagesData.map(m => m.guild))].filter(Boolean);
      
      addLine('', 'normal');
      addLine('ELLSWORTH INDUSTRIES (TM) TERMLINK PROTOCOL', 'header');
      addLine('SYSTEM STATUS REPORT', 'header');
      addLine('', 'normal');
      addLine(`TOTAL COMMUNICATION RECORDS: ${totalMessages}`, 'success');
      addLine(`MONITORED CHANNELS: ${channels.length}`, 'success');
      addLine(`CONNECTED SERVERS: ${servers.length}`, 'success');
      addLine('TERMINAL STATUS: OPERATIONAL', 'success');
      addLine('SECURITY LEVEL: MAXIMUM', 'success');
      addLine('', 'normal');
    } else if (cmd.startsWith('DATE ')) {
      const dateInput = cmd.substring(5).trim();
      const parsedDate = parseDate(dateInput);
      
      if (!parsedDate) {
        addLine('ERROR: INVALID DATE FORMAT', 'error');
        addLine('USE FORMAT: YYYY-MM-DD', 'error');
        return;
      }
      
      const messagesForDate = messagesData.filter(msg => {
        const msgDate = msg.timestamp.split('T')[0];
        return msgDate === parsedDate;
      });
      
      if (messagesForDate.length === 0) {
        addLine(`NO COMMUNICATION RECORDS FOUND FOR ${parsedDate}`, 'error');
      } else {
        addLine('', 'normal');
        addLine(`COMMUNICATION LOG - ${parsedDate}`, 'header');
        addLine(`${messagesForDate.length} RECORDS FOUND`, 'success');
        addLine('', 'normal');
        
        messagesForDate
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(0, 20) // Message limit make bigger if needed
          .forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            const channel = msg.channel || 'UNKNOWN';
            addLine(`[${time}] #${channel.toUpperCase()}`, 'timestamp');
            addLine(msg.content || '[NO MESSAGE CONTENT]', 'message');
            addLine('', 'normal');
          });
          
        if (messagesForDate.length > 20) {
          addLine(`... AND ${messagesForDate.length - 20} MORE RECORDS`, 'warning');
          addLine('', 'normal');
        }
      }
    } else if (cmd === '') {
      // Empty command, do nothing
    } else {
      // Check if it looks like a date without DATE prefix
      if (/^\d{4}-\d{2}-\d{2}$/.test(cmd) || /^\d{2}-\d{2}-\d{4}$/.test(cmd) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cmd)) {
        addLine('ERROR: MISSING COMMAND PREFIX', 'error');
        addLine('TRY: >DATE ' + cmd, 'warning');
      } else {
        addLine(`UNKNOWN COMMAND: ${cmd}`, 'error');
        addLine('TYPE >HELP FOR AVAILABLE COMMANDS', 'error');
      }
    }
  };

  const handleAuthentication = (password) => {
    if (isLocked) return;
    
    if (password.trim() === 'Ethan_Ellsworth') {
      // login using secret password
      addLine(`>${password}`, 'input');
      addLine('', 'normal');
      addLine('WELCOME TO ELLSWORTH INDUSTRIES (TM) TERMLINK', 'success');
      addLine('', 'normal');
      addLine('LOADING COMMUNICATION DATABASE...', 'system');
      
      setTimeout(() => {
        addLine(`LOADED ${messagesData.length} MESSAGE RECORDS`, 'success');
        setTimeout(() => {
          addLine('TERMINAL READY', 'success');
          setTimeout(() => {
            addLine('', 'normal');
            addLine('>HELP                       SHOW AVAILABLE COMMANDS', 'menu');
            addLine('>DATE [YYYY-MM-DD]          VIEW MESSAGES FROM DATE', 'menu');
            addLine('>STATUS                     SYSTEM INFORMATION', 'menu');
            addLine('>CLEAR                      CLEAR TERMINAL', 'menu');
            addLine('', 'normal');
            setIsAuthenticated(true);
            setIsInitialized(true);
          }, 400);
        }, 300);
      }, 500);
    } else {
      // Failed login
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      addLine(`>${password}`, 'input');
      addLine('ACCESS DENIED', 'error');
      
      if (newAttemptCount >= 3) {
        addLine('', 'normal');
        addLine('LOCKOUT IMMINENT', 'error');
        addLine('TERMINAL ACCESS REVOKED', 'error');
        addLine('PLEASE CONTACT SYSTEM ADMINISTRATOR', 'error');
        setIsLocked(true);
      } else {
        const remaining = 3 - newAttemptCount;
        const squares = '■'.repeat(remaining) + '□'.repeat(newAttemptCount);
        addLine('', 'normal');
        addLine(`${remaining} ATTEMPT(S) LEFT: ${squares}`, 'warning');
        addLine('', 'normal');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isAuthenticated && !isLocked) {
        handleAuthentication(currentInput);
      } else if (isAuthenticated) {
        handleCommand(currentInput);
      }
      setCurrentInput('');
    }
  };

  const getLineStyle = (type) => {
    const baseStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '14px',
      lineHeight: '1.3',
      margin: 0,
      padding: '1px 0',
      textShadow: '0 0 8px currentColor, 0 0 15px currentColor'
    };

    switch (type) {
      case 'header': 
        return { ...baseStyle, color: '#00FF41', fontWeight: 'bold', fontSize: '14px' };
      case 'system': 
        return { ...baseStyle, color: '#40FF40' };
      case 'success': 
        return { ...baseStyle, color: '#00FF41' };
      case 'error': 
        return { ...baseStyle, color: '#FF4040' };
      case 'warning': 
        return { ...baseStyle, color: '#FFFF40' };
      case 'input': 
        return { ...baseStyle, color: '#80FF80', fontWeight: 'bold' };
      case 'timestamp': 
        return { ...baseStyle, color: '#60FF60', fontSize: '12px' };
      case 'message': 
        return { ...baseStyle, color: '#A0FFA0', marginLeft: '10px', fontSize: '13px' };
      case 'menu': 
        return { ...baseStyle, color: '#20FF20', fontSize: '13px' };
      default: 
        return { ...baseStyle, color: '#00FF41' };
    }
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: '#000000',
        color: '#00FF41',
        fontFamily: '"Courier New", Courier, monospace',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textShadow: '0 0 15px #00FF41'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>
            ACCESSING COMMUNICATION DATABASE...
          </div>
          <div style={{ fontSize: '14px', color: '#40FF40' }}>
            PLEASE STAND BY
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#000000',
      color: '#00FF41',
      fontFamily: '"Courier New", Courier, monospace',
      minHeight: '100vh',
      padding: '10px',
      backgroundImage: 'radial-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      {/* green border */}
      <div style={{
        border: '3px solid #00FF41',
        borderRadius: '8px',
        backgroundColor: '#000800',
        boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.1), 0 0 30px rgba(0, 255, 65, 0.2)',
        minHeight: 'calc(100vh - 20px)'
      }}>
        {/* header */}
        <div style={{
          borderBottom: '2px solid #00FF41',
          padding: '10px 15px',
          backgroundColor: '#001A00',
          color: '#00FF41',
          fontSize: '14px',
          fontWeight: 'bold',
          textShadow: '0 0 15px #00FF41',
          textAlign: 'center'
        }}>
          ELLSWORTH INDUSTRIES (TM) TERMLINK PROTOCOL
        </div>

        {/* inline content */}
        <div 
          ref={terminalRef}
          style={{
            padding: '15px',
            height: 'calc(100vh - 120px)',
            overflowY: 'auto',
            backgroundColor: '#000800'
          }}
        >
          {terminalLines.map((line) => (
            <div key={line.id} style={getLineStyle(line.type)}>
              {line.text || '\u00A0'}
            </div>
          ))}
          
          {/* input line */}
          {!isLoading && !isLocked && (
            <div style={{ 
              marginTop: '5px',
              color: '#00FF41',
              textShadow: '0 0 10px #00FF41',
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: '14px',
              position: 'relative'
            }}>
              <span>{'>'}{isAuthenticated ? currentInput : '•'.repeat(currentInput.length)}</span>
              <span style={{
                opacity: cursor ? 1 : 0,
                transition: 'opacity 0.1s',
                fontWeight: 'bold',
                textShadow: '0 0 8px #00FF41'
              }}>█</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'transparent',
                  color: 'transparent',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: '14px',
                  outline: 'none',
                  border: 'none',
                  caretColor: 'transparent'
                }}
                autoFocus
              />
            </div>
          )}
          
          {/* fail state */}
          {isLocked && (
            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              color: '#FF4040',
              textShadow: '0 0 10px #FF4040',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              TERMINAL LOCKED
            </div>
          )}
        </div>

        {/* bottom of page */}
        <div style={{
          borderTop: '2px solid #00FF41',
          padding: '8px 15px',
          backgroundColor: '#001A00',
          fontSize: '11px',
          color: '#00FF41',
          textAlign: 'center',
          textShadow: '0 0 10px #00FF41'
        }}>
          ELLSWORTH INDUSTRIES (TM) UNIFIED OPERATING SYSTEM
        </div>
      </div>
    </div>
  );
};

export default FalloutTerminal;