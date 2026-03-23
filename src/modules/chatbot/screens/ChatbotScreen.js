import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

// Simple mock responses
const getMockResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('recipe') || lowerMsg.includes('cook')) {
    return "I can help you find recipes! Try scanning ingredients or searching by name. What would you like to cook?";
  } else if (lowerMsg.includes('ingredient')) {
    return "You can scan ingredients using the camera in the Find Recipes screen. It will suggest recipes based on what you have!";
  } else if (lowerMsg.includes('save') || lowerMsg.includes('favorite')) {
    return "You can save recipes by tapping the bookmark icon on any recipe card. Your saved recipes appear in the Dashboard tab.";
  } else if (lowerMsg.includes('adobo') || lowerMsg.includes('sinigang')) {
    return `Filipino dishes are amazing! ${message.charAt(0).toUpperCase() + message.slice(1)} is a classic. Would you like me to help you find a recipe for it?`;
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return "Hello! I'm your cooking assistant. I can help you find recipes, answer cooking questions, or suggest dishes based on your ingredients. How can I help you today?";
  } else if (lowerMsg.includes('help')) {
    return "Here's what I can help with:\n🔍 Find recipes by name\n📸 Scan ingredients with camera\n💾 Save favorite recipes\n🍽️ Get cooking tips\n🇵🇭 Discover Filipino dishes\n\nJust ask me anything!";
  } else {
    return "That's interesting! I'm here to help with recipes and cooking. Try asking me about a specific dish, ingredients you have, or cooking tips!";
  }
};

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your cooking assistant. I can help you find recipes, suggest dishes, or answer cooking questions. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const suggestions = [
    'Find chicken adobo recipe',
    'What can I cook with eggs?',
    'Healthy Filipino dishes',
    'How to save recipes',
    'What are the ingredients for sinigang?',
    'Cooking tips for beginners',
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate API call delay
    setTimeout(() => {
      const response = getMockResponse(inputText);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={item.isUser ? styles.userText : styles.botText}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={styles.typingIndicator}>
      <View style={styles.dot} />
      <View style={[styles.dot, { marginLeft: 4 }]} />
      <View style={[styles.dot, { marginLeft: 4 }]} />
      <Text style={styles.typingText}>Assistant is typing...</Text>
    </View>
  );

  const renderSuggestion = (suggestion) => (
    <TouchableOpacity
      key={suggestion}
      style={styles.suggestionChip}
      onPress={() => setInputText(suggestion)}
    >
      <Text style={styles.suggestionText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipe Assistant</Text>
        <Text style={styles.headerSubtitle}>Ask me anything about cooking!</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
            ListHeaderComponent={
              messages.length === 1 ? (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Try asking:</Text>
                  <View style={styles.suggestionsList}>
                    {suggestions.map(renderSuggestion)}
                  </View>
                </View>
              ) : null
            }
            ListFooterComponent={isTyping ? renderTypingIndicator : null}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about cooking..."
            placeholderTextColor={colors.gray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
          >
            <Icon name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: colors.lightGray,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: colors.white,
    fontSize: 16,
  },
  botText: {
    color: colors.black,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: colors.white,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray,
  },
  typingText: {
    marginLeft: 12,
    fontSize: 12,
    color: colors.gray,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray,
    marginBottom: 12,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  suggestionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
};

export default ChatbotScreen;