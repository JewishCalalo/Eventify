import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native'
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
    <View style={{
      padding: 20,
      paddingTop:20,
    }}>
      <TouchableOpacity onPress={()=>router.back()}>
      <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={{
        fontFamily:'montserrat-bold',
        fontSize: 35,
        marginTop: 10
      }}>Register Now</Text>

        <View style={{
            marginTop:45
        }}>
            <Text style={{
                fontFamily: 'montserrat-italic'
            }}>  Full Name</Text>
            <TextInput 
            style={styles.input}
            placeholder='Enter Your Name'
            onChangeText={(value)=>setFullName(value)}>
            </TextInput>
        </View>
        <View style={{
            marginTop:25
        }}>
            <Text style={{
                fontFamily: 'montserrat-italic'
            }}>  Email</Text>
            <TextInput 
            style={styles.input}
            placeholder='Enter Your Email'
            onChangeText={(value)=>setEmail(value)}>
            </TextInput>
        </View>
        <View style={{
            marginTop:25
        }}>
            <Text style={{
                fontFamily: 'montserrat-italic'
            }}>  Password</Text>
            <TextInput 
            secureTextEntry={true}
            style={styles.input}
            placeholder='Enter Your Password'
            onChangeText={(value)=>setPassword(value)}>
            </TextInput>
        </View>
        <TouchableOpacity 
          onPress={OnCreateAccount}
          style={{
            marginTop:40,
            padding:20,
            backgroundColor:Colors.lightorange,
            borderRadius:15
        }}>
            <Text style={{
                color:Colors.verydarkblue,
                textAlign:'center'
            }}>Register account</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={()=>router.replace('auth/sign-in')}
        style={{
            marginTop:1,
            padding:20,
            borderRadius:15,

        }}>
            <Text style={{
                color:Colors.primary,
                textAlign:'center',
                fontFamily: 'montserrat-italic',
            }}>Sign In</Text>
        </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  input:{
        
    padding: 10,
    borderWidth: 1,
    borderRadius:15,
    borderColor:Colors.verydarkblue
}
})