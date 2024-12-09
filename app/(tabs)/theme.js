// theme.js
export const theme = {
    background: '#f0f0f0',
    text: '#333333',
    icon: '#1e90ff',
    headerBackground: '#ffffff',
    headerText: '#333333',
  };
  
  import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { EventContext } from '/React Native/Eventify/app/(tabs)/EventContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ArrowUpIcon from '/React Native/Eventify/assets/images/up-arrow.png';
import ArrowDownIcon from '/React Native/Eventify/assets/images/down-arrow.png';
import EyeIcon from '/React Native/Eventify/assets/images/eye.png';
import EyeOffIcon from '/React Native/Eventify/assets/images/hide.png';

const Something = ({ item }) => (
  <View style={[styles.dropdownContainer, { zIndex: item.open ? 5000 : 1 }]}>
    <Text style={[styles.label, { color: item.theme.text }]}>{item.label}:</Text>
    <DropDownPicker
      open={item.open}
      value={item.value}
      items={item.items}
      setOpen={item.setOpen}
      setValue={item.setValue}
      setItems={item.setItems}
      style={styles.dropdown}
      dropDownContainerStyle={styles.dropdownMenuContainer}
      placeholder={`Select ${item.label.toLowerCase()}`}
      textStyle={styles.dropdownText}
      labelStyle={styles.dropdownLabel}
      selectedItemContainerStyle={styles.selectedItemContainer}
      selectedItemLabelStyle={styles.selectedItemLabel}
      ArrowUpIconComponent={({ style }) => <Image source={ArrowUpIcon} style={[styles.iconSize, style]} />}
      ArrowDownIconComponent={({ style }) => <Image source={ArrowDownIcon} style={[styles.iconSize, style]} />}
    />
  </View>
);

export default function Settings() {
  const { setTheme, setLanguage, theme, language, fonts, setFonts } = useContext(EventContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [selectedFont, setSelectedFont] = useState(fonts);
  const [colorTheme, setColorTheme] = useState(theme.icon);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showHeader, setShowHeader] = useState(false);
  const navigation = useNavigation();

  const [openLanguage, setOpenLanguage] = useState(false);
  const [openTheme, setOpenTheme] = useState(false);
  const [openFontStyle, setOpenFontStyle] = useState(false);

  const [languages, setLanguages] = useState([
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'German', value: 'de' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Korean', value: 'ko' },
    { label: 'Russian', value: 'ru' },
  ]);

  const [themes, setThemes] = useState([
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Purple', value: 'purple' },
    { label: 'Green', value: 'green' },
    { label: 'Orange', value: 'orange' },
    { label: 'System Default', value: 'system' },
  ]);

  const [fontStyles, setFontStyles] = useState([
    { label: 'Montserrat', value: 'montserrat' },
    { label: 'Roboto', value: 'roboto' },
    { label: 'Arial', value: 'arial' },
  ]);

  const auth = getAuth(); // Initialize Firebase auth

  const reauthenticate = (currentPassword) => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    return reauthenticateWithCredential(user, credential);
  };

  const handlePasswordChange = async () => {
    try {
      await reauthenticate(currentPassword);
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert("Password updated successfully!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleResetToDefault = async () => {
    setColorTheme('#800080');
    setSelectedFont('montserrat');
    setTheme({
      background: '#fff',
      text: '#000',
      icon: '#800080',
      mode: 'light',
    });
    setLanguage('en');
    await AsyncStorage.multiSet([
      ['theme', JSON.stringify({
        background: '#fff',
        text: '#000',
        icon: '#800080',
        mode: 'light',
      })],
      ['language', 'en'],
      ['fonts', 'montserrat']
    ]);
    Alert.alert("Theme, font style, and language reset to default.");
  };

  const handleApplyChanges = async () => {
    setTheme(prevTheme => ({
      ...prevTheme,
      icon: colorTheme,
    }));
    setLanguage(selectedLanguage);
    setFonts(selectedFont);
    await AsyncStorage.multiSet([
      ['theme', JSON.stringify({
        ...theme,
        icon: colorTheme
      })],
      ['language', selectedLanguage],
      ['fonts', selectedFont]
    ]);
    Alert.alert("Settings applied.", "", [
      {
        text: "OK",
        onPress: () => navigation.navigate('Profile'),
      },
    ]);
  };

  const cancelPasswordChange = () => {
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
  };

  const settingsData = [
    { key: 'language', label: 'Language', open: openLanguage, value: selectedLanguage, items: languages, setOpen: setOpenLanguage, setValue: setSelectedLanguage, setItems: setLanguages },
    { key: 'theme', label: 'Theme', open: openTheme, value: colorTheme, items: themes, setOpen: setOpenTheme, setValue: setColorTheme, setItems: setThemes },
    { key: 'fontStyle', label: 'Font Style', open: openFontStyle, value: selectedFont, items: fontStyles, setOpen: setOpenFontStyle, setValue: setSelectedFont, setItems: setFontStyles },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {showSettings ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={navigation.goBack}>
            <Text style={[styles.goBack, { color: theme.icon }]}>{"<"} Go Back</Text>
          </TouchableOpacity>
          {showHeader && (
            <Text style={[styles.header, { color: theme.text }]}>Settings</Text>
          )}
          {settingsData.map((item) => (
            <Something key={item.key} item={{ ...item, theme }} />
          ))}
          {showPasswordChange && (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { borderColor: theme.icon }]}
                  placeholder="Current Password"
                  placeholderTextColor={theme.text}
                  secureTextEntry={!showPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.revealButton}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Image source={showPassword ? EyeOffIcon : EyeIcon} style={[styles.iconSize, { tintColor: theme.icon }]} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { borderColor: theme.icon }]}
                  placeholder="New Password"
                  placeholderTextColor={theme.text}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                                <TouchableOpacity
                  style={styles.revealButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Image source={showNewPassword ? EyeOffIcon : EyeIcon} style={[styles.iconSize, { tintColor: theme.icon }]} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={handlePasswordChange}>
                <Text style={[styles.buttonText, { color: theme.text }]}>Confirm Password Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={cancelPasswordChange}>
                <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          {!showPasswordChange && (
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={() => setShowPasswordChange(true)}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Change Password</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={handleApplyChanges}>
            <Text style={[styles.buttonText, { color: theme.text }]}>Apply Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.icon }]} onPress={handleResetToDefault}>
            <Text style={[styles.buttonText, { color: theme.text }]}>Reset to Default</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Text style={[styles.buttonText, { color: theme.text }]}>Show Settings</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
  },
  goBack: {
    fontSize: 18,
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    marginHorizontal: 10,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 0,
  },
  revealButton: {
    paddingHorizontal: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginHorizontal: 10,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 10,
    zIndex: 5000,
    elevation: 3,
  },
  dropdownContainer: {
    marginBottom: 15,
    zIndex: 1000,
  },
  dropdownMenuContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    zIndex: 1000,
    elevation: 3,
  },
  dropdownText: {
    color: '#333',
    fontSize: 16,
  },
  dropdownLabel: {
    color: '#333',
    fontSize: 16,
  },
  selectedItemContainer: {
    backgroundColor: '#e6e6e6',
    borderRadius: 12,
  },
  selectedItemLabel: {
    fontWeight: 'bold',
  },
  iconSize: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});
