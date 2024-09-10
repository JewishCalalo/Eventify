import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import { useEffect } from 'react'
import {Colors} from './../../../constants/Colors'
import { useNavigation, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {auth} from './../../../configs/FirebaseConfig'

export default function SignIn() {
    const navigation=useNavigation();
    const router=useRouter();

    const [email,setEmail]=useState();
    const [password,setPassword]=useState();

    useEffect(()=>{
        navigation.setOptions({
            headerShown:false
        })
    }, []);

const onSignIn=()=>{

if(!email&&!password)
{
    ToastAndroid.show('Incomplete details entered',ToastAndroid.LONG)
    return;
}

    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log(user);
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage,error.code);
    if(errorCode=='auth/invalid-credential')
    {
        ToastAndroid.show('Invalid Credential',ToastAndroid.LONG)
    }
  });
}

  return (
    <View style={{
        padding:25,
        backgroundColor: Colors.white,
        height:'100%',
        paddingTop: 20
    }}>
        <TouchableOpacity onPress={()=>router.back()}>
      <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
        <Text style={{
            fontFamily:'montserrat-bold',
            color:Colors.primary,
            padding: 5,
            marginTop: 5,
            fontSize: 35
        }}>Sign in Here</Text>
        <Text style={{
            fontFamily:'montserrat',
            padding: 5,
            marginTop: 40,
            fontSize: 25,
            color:Colors.verydarkblue
        }}>Welcome Back</Text>

        <View style={{
            marginTop:20
        }}>
            <Text style={{
                fontFamily: 'montserrat-italic'
            }}>  Email</Text>
            <TextInput 
            style={styles.input}
            onChangeText={(value)=>setEmail(value)}
            placeholder='Enter Your Email'></TextInput>
        </View>
        <View style={{
            marginTop:15
        }}>
            <Text style={{
                fontFamily: 'montserrat-italic'
            }}>  Password</Text>
            <TextInput 
            secureTextEntry={true}
            style={styles.input}
            onChangeText={(value)=>setPassword(value)}
            placeholder='Enter Your Password'></TextInput>
        </View>

        <TouchableOpacity onPress={onSignIn} style={{
            marginTop:30,
            padding:20,
            backgroundColor:Colors.lightorange,
            borderRadius:15
        }}>
            <Text style={{
                color:Colors.verydarkblue,
                textAlign:'center'
            }}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={()=>router.replace('auth/sign-up')}
        style={{
            marginTop:5,
            padding:20,
            backgroundColor:Colors.white,
            borderRadius:15,

        }}>
            <Text style={{
                color:Colors.primary,
                textAlign:'center',
                fontFamily: 'montserrat-italic',
            }}>Register an account</Text>
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