import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './WordCloud.css';

const WordCloud = () => {
  const svgRef = useRef();
  const [messagesData, setMessagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wordData, setWordData] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

  // Real-time clock in user's local timezone
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Get user's timezone automatically
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Format time in user's timezone
      const localTime = now.toLocaleString('en-US', {
        timeZone: userTimezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Get timezone abbreviation
      const timezoneAbbr = now.toLocaleString('en-US', {
        timeZone: userTimezone,
        timeZoneName: 'short'
      }).split(' ').pop();
      
      setCurrentTime(`${localTime} ${timezoneAbbr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load messages from user_messages.json file
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch('/user_messages.json');
        const data = await response.json();
        
        const messages = data.messages || data;
        const generalMessages = messages.filter(msg => 
          msg.channel === 'general' && msg.content && msg.content.trim()
        );
        
        setMessagesData(generalMessages);
        console.log(`Loaded ${generalMessages.length} messages from #general`);
        
      } catch (error) {
        console.error('Could not load user_messages.json:', error);
      }
      setLoading(false);
    };
    
    loadMessages();
  }, []);

  // Common words to filter out
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'around', 'behind', 'beyond', 'inside',
    'outside', 'under', 'over', 'a', 'an', 'as', 'are', 'was', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'can', 'may', 'might', 'must', 'shall', 'is', 'am', 'i', 'you',
    'he', 'she', 'it', 'we', 'they', 'them', 'their', 'this', 'that', 'these',
    'those', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'now', 'then', 'here', 'there', 'also', 'its', "it's", 'get', 'got', 'like',
    'one', 'two', 'first', 'last', 'good', 'new', 'old', 'great', 'little',
    'right', 'big', 'small', 'long', 'way', 'well', 'back', 'much', 'go', 'see',
    'https', 'com', 'youtube', 'tiktok', 'www', 'his', 'her', 'let', 'don'
  ]);

  // Process messages to extract word frequencies
  const processMessages = (messages) => {
    const wordCount = {};
    
    messages.forEach(msg => {
      if (!msg.content) return;
      
      const words = msg.content
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          !stopWords.has(word) && 
          !/^\d+$/.test(word)
        );
      
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });
    
    return Object.entries(wordCount)
      .map(([text, size]) => ({ text, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 50);
  };

  // Process messages when data changes
  useEffect(() => {
    if (messagesData.length > 0) {
      const words = processMessages(messagesData);
      setWordData(words);
    }
  }, [messagesData]);

  // D3 Word Cloud Layout
  useEffect(() => {
    if (wordData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 900;
    const height = 600;
    const margin = 30;

    svg
      .attr('width', width)
      .attr('height', height)
      .classed('wordcloud-svg', true);

    const colorScale = d3.scaleOrdinal()
      .domain(d3.range(wordData.length))
      .range(['#00ff41', '#40ff00', '#80ff40', '#b3ff66', '#ccff99', '#ffffff', '#e6ffe6']);

    const maxFreq = d3.max(wordData, d => d.size);
    const fontScale = d3.scaleLinear()
      .domain([1, maxFreq])
      .range([16, 70]);

    // Collision detection functions this was retarded
    const centerX = width / 2;
    const centerY = height / 2;
    const positions = [];
    const placedWords = [];
    
    const getTextBounds = (text, fontSize, rotation, x, y) => {
      const textWidth = text.length * fontSize * 0.6;
      const textHeight = fontSize;
      
      if (rotation === -90) {
        return {
          left: x - textHeight / 2,
          right: x + textHeight / 2,
          top: y - textWidth / 2,
          bottom: y + textWidth / 2
        };
      } else {
        return {
          left: x - textWidth / 2,
          right: x + textWidth / 2,
          top: y - textHeight / 2,
          bottom: y + textHeight / 2
        };
      }
    };
    
    const isPositionFree = (text, fontSize, rotation, x, y) => {
      const newBounds = getTextBounds(text, fontSize, rotation, x, y);
      const padding = 4;
      
      return !placedWords.some(placed => {
        return !(newBounds.right + padding < placed.left ||
                newBounds.left - padding > placed.right ||
                newBounds.bottom + padding < placed.top ||
                newBounds.top - padding > placed.bottom);
      });
    };

    // Position words also retarded
    wordData.forEach((d, i) => {
      const fontSize = fontScale(d.size);
      const isVertical = Math.random() < 0.25;
      const rotation = isVertical ? -90 : 0;
      let x, y;
      let found = false;
      
      for (let radius = 0; radius < 280 && !found; radius += 8) {
        for (let angle = 0; angle < 2 * Math.PI && !found; angle += 0.1) {
          x = centerX + radius * Math.cos(angle);
          y = centerY + radius * Math.sin(angle);
          
          const bounds = getTextBounds(d.text, fontSize, rotation, x, y);
          
          if (bounds.left > margin && bounds.right < width - margin &&
              bounds.top > margin && bounds.bottom < height - margin) {
            
            if (isPositionFree(d.text, fontSize, rotation, x, y)) {
              placedWords.push(bounds);
              found = true;
            }
          }
        }
      }
      
      if (!found) {
        for (let attempts = 0; attempts < 30 && !found; attempts++) {
          x = margin + Math.random() * (width - 2 * margin);
          y = margin + Math.random() * (height - 2 * margin);
          
          const bounds = getTextBounds(d.text, fontSize, rotation, x, y);
          
          if (bounds.left > margin && bounds.right < width - margin &&
              bounds.top > margin && bounds.bottom < height - margin &&
              isPositionFree(d.text, fontSize, rotation, x, y)) {
            
            placedWords.push(bounds);
            found = true;
          }
        }
      }
      
      if (!found) {
        x = centerX + (Math.random() - 0.5) * 100;
        y = centerY + (Math.random() - 0.5) * 100;
      }

      positions.push({
        ...d,
        x,
        y,
        fontSize,
        rotation
      });
    });

    // Create text elements
    const textElements = svg.selectAll('text')
      .data(positions)
      .enter()
      .append('text')
      .text(d => d.text)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('transform', d => `rotate(${d.rotation}, ${d.x}, ${d.y})`)
      .style('font-family', 'Monaco, "Lucida Console", monospace')
      .style('font-size', d => `${d.fontSize}px`)
      .style('fill', (d, i) => colorScale(i))
      .style('opacity', 0)
      .style('cursor', 'pointer')
      .style('text-shadow', '0 0 3px currentColor');

    // Animate in
    textElements
      .transition()
      .duration(1200)
      .delay((d, i) => i * 40)
      .style('opacity', 0.9);

    // Hover effects
    textElements
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', 1)
          .style('font-size', `${d.fontSize * 1.15}px`)
          .style('text-shadow', '0 0 8px currentColor, 0 0 15px currentColor');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', 0.9)
          .style('font-size', `${d.fontSize}px`)
          .style('text-shadow', '0 0 3px currentColor');
      });

  }, [wordData]);

  if (loading) {
    return (
      <div className="wordcloud-loading">
        <div className="wordcloud-loading-content">
          <div className="wordcloud-loading-text">
            Loading...
          </div>
          <div className="wordcloud-loading-bar">
            <div className="wordcloud-loading-progress" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wordcloud-container">
      <div className="wordcloud-header">
        <h1 className="wordcloud-title">
          ETHAN ELLSWORTH
        </h1>
        <div className="wordcloud-subtitle">
          WORD FREQUENCY ANALYSIS
        </div>
        <div className="wordcloud-status">
          {currentTime} • {messagesData.length} msgs • {wordData.length} terms
        </div>
      </div>
      
      <div className="wordcloud-svg-container">
        <div className="wordcloud-svg-wrapper">
          <svg ref={svgRef}></svg>
        </div>
      </div>

      <div className="wordcloud-footer">
        Discord #general channel analysis
      </div>
    </div>
  );
};

export default WordCloud;