import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatbotService from '../services/chatbot.service';

const { width } = Dimensions.get('window');

const theme = {
  primary: '#ff6b6b',
  primaryDark: '#e85555',
  primaryFaint: '#fff0f0',
  primaryLight: '#ff8e8e',
  secondary: '#ff9f43',
  secondaryFaint: '#fff8f0',
  teal: '#00c9a7',
  tealFaint: '#f0fdf9',
  blue: '#33b5e5',
  blueFaint: '#f0f8ff',
  dark: '#1a1a2e',
  gray: '#8a8a9a',
  lightGray: '#f4f4f8', 
  white: '#ffffff',
};

const PressableScale = ({ onPress, style, children, activeOpacity = 0.82 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Moved OUTSIDE the screen component to prevent re-renders ──

const useTypingAnimation = () => {
  const typingAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(typingAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    return () => typingAnim.stopAnimation();
  }, [typingAnim]);
  return typingAnim;
};

const useMessageAnimation = (index) => {
  const messageAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(messageAnim, {
      toValue: 1,
      tension: 55,
      friction: 9,
      useNativeDriver: true,
      delay: index * 50,
    }).start();
  }, [messageAnim, index]);
  return messageAnim;
};

const TypingIndicator = memo(() => {
  const typingAnim = useTypingAnimation();
  const dot1Opacity = typingAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] });
  const dot2Opacity = typingAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] });
  const dot3Opacity = typingAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] });

  return (
    <View style={styles.typingWrapper}>
      <View style={styles.avatar}>
        <Icon name="restaurant" size={20} color={theme.primary} />
      </View>
      <View style={styles.typingIndicator}>
        <Animated.View style={[styles.dot, { backgroundColor: theme.primary, opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { marginLeft: 4, backgroundColor: theme.primaryLight, opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { marginLeft: 4, backgroundColor: theme.primaryFaint, opacity: dot3Opacity }]} />
        <Text style={styles.typingText}>Assistant is typing...</Text>
      </View>
    </View>
  );
});

const MessageItem = memo(({ item, index }) => {
  const messageAnim = useMessageAnimation(index);
  const translateY = messageAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });

  return (
    <Animated.View
      style={[
        styles.messageWrapper,
        item.isUser ? styles.userWrapper : styles.botWrapper,
        { opacity: messageAnim, transform: [{ translateY }] },
      ]}
    >
      {!item.isUser && (
        <View style={styles.avatar}>
          <Icon name="restaurant" size={20} color={theme.primary} />
        </View>
      )}
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={item.isUser ? styles.userText : styles.botText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  );
});

const suggestions = [
  { icon: 'restaurant', text: 'How to make chicken adobo?', color: theme.primary,   bg: theme.primaryFaint   },
  { icon: 'egg',        text: 'What can I cook with eggs?',  color: theme.secondary, bg: theme.secondaryFaint },
  { icon: 'heart',      text: 'Healthy Filipino dishes',     color: theme.teal,      bg: theme.tealFaint      },
  { icon: 'bookmark',   text: 'How to save recipes?',        color: theme.primary,   bg: theme.primaryFaint   },
  { icon: 'fish',       text: 'What is sinigang?',           color: theme.blue,      bg: theme.blueFaint      },
  { icon: 'bulb',       text: 'Cooking tips for beginners',  color: theme.secondary, bg: theme.secondaryFaint },
];

const SuggestionItem = memo(({ suggestion, onPress }) => (
  <PressableScale onPress={() => onPress(suggestion.text)}>
    <View style={[styles.suggestionChip, { backgroundColor: suggestion.bg }]}>
      <Icon name={suggestion.icon} size={14} color={suggestion.color} style={styles.suggestionIcon} />
      <Text style={[styles.suggestionText, { color: suggestion.color }]}>{suggestion.text}</Text>
    </View>
  </PressableScale>
));

// ── Screen component ──

const ChatbotScreen = () => {
  const navigation = useNavigation();
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef();
  const tabBarHeight = useBottomTabBarHeight();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const inputAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.timing(inputAnim,  { toValue: 1, duration: 480, delay: 200, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide  = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const result = await ChatbotService.sendMessage(userMessage.text);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: result.reply,
        isUser: false,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [inputText, isTyping]);

  const handleSuggestionPress = useCallback((text) => {
    setInputText(text);
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => <MessageItem item={item} index={index} />,
    []
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const ListHeader = useCallback(() =>
    messages.length === 1 ? (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>✨ Try asking:</Text>
        <View style={styles.suggestionsList}>
          {suggestions.map((s) => (
            <SuggestionItem key={s.text} suggestion={s} onPress={handleSuggestionPress} />
          ))}
        </View>
      </View>
    ) : null,
  [messages.length, handleSuggestionPress]);

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-22, 0] });
  const inputTranslateY  = inputAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />

      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // offset = tab bar height so the input sits just above it when keyboard is hidden
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerTranslateY }] }]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerIconBadge}>
              <Icon name="chatbubble-ellipses" size={28} color={theme.primary} />
            </View>
          </View>
          <Text style={styles.headerTitle}>Recipe Assistant</Text>
          <Text style={styles.headerSubtitle}>Ask me anything about cooking! 🍳</Text>
        </Animated.View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.messagesList,
            // when keyboard is hidden, pad the bottom so content clears the tab bar
            { paddingBottom: keyboardVisible ? 16 : tabBarHeight + 16 },
          ]}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          scrollEnabled
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={ListHeader}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Input */}
        <Animated.View
          style={[
            styles.inputContainer,
            keyboardVisible && styles.inputContainerActive,
            {
              // hide above the tab bar when keyboard is not shown
              marginBottom: keyboardVisible ? 0 : tabBarHeight,
              opacity: inputAnim,
              transform: [{ translateY: inputTranslateY }],
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about cooking..."
            placeholderTextColor={theme.gray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <PressableScale onPress={handleSend} disabled={!inputText.trim() || isTyping}>
            <View style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}>
              <Icon name="send" size={20} color={theme.white} />
            </View>
          </PressableScale>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  safe: { flex: 1, backgroundColor: '#fafafa' },

  blob1: { position: 'absolute', top: -70, right: -70, width: 240, height: 240, borderRadius: 120, backgroundColor: '#ffeded', opacity: 0.6 },
  blob2: { position: 'absolute', top: 200, left: -90, width: 200, height: 200, borderRadius: 100, backgroundColor: '#fff8f0', opacity: 0.5 },

  keyboardView: { flex: 1 },

  header: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 20, backgroundColor: 'transparent' },
  headerTop: { alignItems: 'center', marginBottom: 16 },
  headerIconBadge: { width: 68, height: 68, borderRadius: 22, backgroundColor: theme.primaryFaint, justifyContent: 'center', alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 5 },
  headerTitle: { fontSize: 36, fontWeight: '800', color: theme.primary, letterSpacing: -1, marginBottom: 8, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: theme.gray, lineHeight: 21, textAlign: 'center' },

  messagesList: { padding: 16, flexGrow: 1 },

  messageWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userWrapper: { justifyContent: 'flex-end' },
  botWrapper:  { justifyContent: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.primaryFaint, justifyContent: 'center', alignItems: 'center', marginRight: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  messageBubble: { maxWidth: '75%', padding: 14, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  userBubble: { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
  botBubble:  { backgroundColor: theme.white,   borderBottomLeftRadius:  4 },
  userText: { color: theme.white, fontSize: 15, lineHeight: 20 },
  botText:  { color: theme.dark,  fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 10, color: theme.gray, marginTop: 6, alignSelf: 'flex-end' },

  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: theme.lightGray, backgroundColor: theme.white, alignItems: 'flex-end' },
  inputContainerActive: { borderTopColor: theme.primaryFaint, shadowColor: theme.primary, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  input: { flex: 1, borderWidth: 1, borderColor: theme.lightGray, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 12, marginRight: 12, fontSize: 15, maxHeight: 100, backgroundColor: theme.white, color: theme.dark },
  sendButton: { backgroundColor: theme.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  sendButtonDisabled: { backgroundColor: theme.gray, shadowOpacity: 0 },

  typingWrapper: { flexDirection: 'row', marginTop: 8, marginBottom: 16, alignItems: 'center' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.white, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  typingText: { marginLeft: 12, fontSize: 12, color: theme.gray },

  suggestionsContainer: { marginBottom: 24, paddingTop: 8 },
  suggestionsTitle: { fontSize: 12, fontWeight: '700', color: theme.gray, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },
  suggestionsList: { flexDirection: 'row', flexWrap: 'wrap' },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  suggestionIcon: { marginRight: 6 },
  suggestionText: { fontSize: 13, fontWeight: '500' },
};

export default ChatbotScreen;