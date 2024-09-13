import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react'
import { useNavigation, useRouter } from 'expo-router'
import {Colors} from './../../../constants/Colors'
import { useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth} from './../../../configs/FirebaseConfig';

export default function SignUp() {
  const navigation=useNavigation();
  const router=useRouter();

  const [email,setEmail]=useState();
  const [password,setPassword]=useState();
  const [fullName,setFullName]=useState();

  useEffect(()=>{
    navigation.setOptions({
      headerShown: false
    })
  }, []);

  const OnCreateAccount=()=>{

      if(!email&&!password&&!fullName)
      {
        ToastAndroid.show('Incomplete details entered',ToastAndroid.SHORT)
        return;
      }

    createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    router.replace('/home')
    console.log=(user);
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage,error.code);
    // ..
  });
  }

  return (
    <SafeAreaView>

        <View style={styles.container}>

            <View style = {styles.topVectorContainer}>
                <Image
                    source = {require("../../../assets/images/registerTop.png")}
                    style = {styles.topVector}
                />
            </View>

            <TouchableOpacity onPress={()=>router.back()}>
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
                    placeholder='Enter your name'
                    onChangeText={(value)=>setFullName(value)}>
                </TextInput>

                <Text style={styles.inputHeader}>
                    Email
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter your email'
                    onChangeText={(value)=>setEmail(value)}>
                </TextInput>

                <Text style={styles.inputHeader}>
                    Password
                </Text>
                <TextInput
                    secureTextEntry={true}
                    style={styles.input}
                    placeholder='Enter your password'
                    onChangeText={(value)=>setPassword(value)}>
                </TextInput>
            </View>


            <View style={styles.buttonRegisterContainer}>
                <TouchableOpacity onPress={OnCreateAccount} style={styles.buttonRegister}>
                    <Text style={styles.buttonRegisterText}>
                        Register
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>router.replace('auth/sign-in')} style={styles.buttonSignin}>
                    <Text style={styles.buttonSigninText}>
                        Sign In
                    </Text>
                </TouchableOpacity>
            </View>


            <View style = {styles.bottomVectorContainer}>
                <Image
                    source = {require("../../../assets/images/registerBottom.png")}
                    style = {styles.bottomVector}
                />
            </View>

        </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
      backgroundColor: 'white',
      height: '100%',
  },

  topVectorContainer:{
      height: 20 ,
  },

  topVector:{
      width: '100%',
      height: 220 ,
  },

  bottomVectorContainer:{
      height:'100%',
      flex: 1,
      flexDirection: 'column' ,
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
  },

  bottomVector:{
      position: 'absolute',
  },

  headerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 0.4
  },

  header: {
      fontFamily:'montserrat-bold',
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
      fontSize: 20 ,
      marginTop: 15,
  },

  input: {
      marginTop: 10,
      padding: 10 ,
      borderWidth: 2 ,
      borderColor: 'transparent' ,
      backgroundColor: 'white' ,
      width: 350 ,
      height: 50 ,
      borderRadius: 30 ,
      elevation: 20 ,
      alignSelf: 'center',
  },

  buttonRegisterContainer:{
      justifyContent: 'center',
      alignItems: 'center',
      flex: 0.5,
      flexWrap:'nowrap',
  },

  buttonRegister: {
      padding:15,
      backgroundColor:'#65558f',
      borderRadius: 30,
      width: 320,
      elevation: 20 ,
  },

  buttonRegisterText: {
      color:'white',
      textAlign:'center'
  },

  buttonSigninText: {
      marginTop: 15,
      color:Colors.primary,
      textAlign:'center',
      fontFamily: 'montserrat',
  },
})