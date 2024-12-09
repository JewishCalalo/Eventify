import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { Colors } from './../../../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from './../../../configs/FirebaseConfig';

export default function SignUp() {
  const navigation = useNavigation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [isEmailValid, setIsEmailValid] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(null);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Minimum 8 characters, at least one letter and one number
    return re.test(password);
  };

  const generateFriendID = async () => {
    let isUnique = false;
    let friendID;

    while (!isUnique) {
      friendID = Math.floor(1000000 + Math.random() * 9000000).toString(); // Generate a 7-digit number
      const friendQuery = query(collection(db, 'users'), where('friendID', '==', friendID));
      const friendSnapshot = await getDocs(friendQuery);
      isUnique = friendSnapshot.empty;
    }

    return friendID;
  };

  const OnCreateAccount = async () => {
    if (!email || !password || !fullName || !confirmPassword) {
      ToastAndroid.show('Incomplete details entered', ToastAndroid.SHORT);
      return;
    }

    if (!validateEmail(email)) {
      ToastAndroid.show('Invalid email format', ToastAndroid.SHORT);
      return;
    }

    if (!validatePassword(password)) {
      ToastAndroid.show('Password must be at least 8 characters long and contain at least one letter and one number', ToastAndroid.SHORT);
      return;
    }

    if (password !== confirmPassword) {
      ToastAndroid.show('Passwords do not match', ToastAndroid.SHORT);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const friendID = await generateFriendID();
      const userDocRef = doc(collection(db, 'users'), user.uid);
      await setDoc(userDocRef, { fullName, email, friendID });

      router.replace('/home');
      console.log(user);
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage, errorCode);
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setIsPasswordValid(validatePassword(value));
    setDoPasswordsMatch(value === confirmPassword);
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setDoPasswordsMatch(value === password);
  };

  const disableCopyPaste = (event) => {
    event.preventDefault();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            <View style={styles.topVectorContainer}>
              <Image
                source={require("../../../assets/images/registerTop.png")}
                style={styles.topVector}
              />
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>
                Register Now
              </Text>
            </View>
            <View style={styles.inputContainer1}>
              <Text style={styles.inputHeader}>
                Full Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder='Enter your full name'
                onChangeText={(value) => setFullName(value)}
              />
              <Text style={styles.inputHeader}>
                Email
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder='Enter your email'
                  onChangeText={handleEmailChange}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />
                {isEmailValid !== null && (
                  <Ionicons
                    name={isEmailValid ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={isEmailValid ? "purple" : "red"}
                    style={styles.validationIcon}
                  />
                )}
              </View>
              <Text style={styles.inputHeader}>
                Password
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  placeholder='Enter your password'
                  onChangeText={handlePasswordChange}
                  onPaste={disableCopyPaste}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                    style={styles.revealIcon}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHeader}>
                Re-enter Password
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  placeholder='Re-enter your password'
                  onChangeText={handleConfirmPasswordChange}
                  onPaste={disableCopyPaste}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="gray"
                    style={styles.revealIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.buttonRegisterContainer}>
              <TouchableOpacity
                onPress={OnCreateAccount}
                style={styles.buttonRegister}
              >
                <Text style={styles.buttonRegisterText}>
                  Register
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace('auth/sign-in')}
                style={styles.buttonSigninText}
              >
                <Text style={styles.buttonSigninText}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bottomVectorContainer}>
              <Image
                source={require("../../../assets/images/registerBottom.png")}
                style={styles.bottomVector}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
  },
  topVectorContainer: {
    height: 20,
  },
  topVector: {
    width: '100%',
    height: 220,
  },
  bottomVectorContainer: {
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  bottomVector: {
    position: 'absolute',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.4,
  },
  header: {
    fontFamily: 'montserrat-bold',
    fontSize: 35,
    color: Colors.primary,
  },
  inputContainer1: {
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 20,
    flex: 4,
  },
  inputHeader: {
    fontFamily: 'montserrat',
    fontSize: 20,
    marginTop: 15,
  },
  input: {
    marginTop: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'white',
    width: 310,
    height: 50,
    borderRadius: 30,
    elevation: 20,
    alignSelf: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 305,
  },
  validationIcon: {
    position: 'absolute',
    right: 9,
  },
  revealIcon: {
    position: 'absolute',
    right: 9,
  },
  buttonRegisterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.5,
    flexWrap: 'nowrap',
  },
  buttonRegister: {
    padding: 15,
    backgroundColor: '#65558f',
    borderRadius: 30,
    width: 320,
    elevation: 20,
  },
  buttonRegisterText: {
    color: 'white',
    textAlign: 'center',
  },
  buttonSigninText: {
    marginTop: 15,
    color: Colors.primary,
    textAlign: 'center',
    fontFamily: 'montserrat',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});


