import { View, Text, TextInput, StyleSheet, TouchableOpacity, ToastAndroid, Image } from 'react-native'
import React, { useState } from 'react'
import { useEffect } from 'react'
import {Colors} from './../../../constants/Colors'
import { useNavigation, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
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
    ToastAndroid.show('Invalid Email and Password',ToastAndroid.SHORT)
    return;
}

    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    router.replace('/home')
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
    <SafeAreaView>
        <View style={styles.container}>

            <View style={styles.headerContainer}
                <TouchableOpacity onPress={()=>router.back()}>
                <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.subheader}></Text>
            </View>


<View style={styles.inputContainer1}>
<Text style={styles.placeholder}>Email</Text>
<TextInput
style={styles.input}
onChangeText={(value)=>setEmail(value)}
placeholder='Enter Your Email'>
</TextInput>
</View>

<View style={styles.inputContainer2}>
<Text style={styles.placeholder}>Password</Text>
<TextInput
secureTextEntry={true}
style={styles.input}
onChangeText={(value)=>setPassword(value)}
placeholder='Enter Your Password'></TextInput>
</View>

<TouchableOpacity onPress={onSignIn} style={styles.buttonSignIn}>
<Text style={styles.buttonTextSignIn}>Sign In</Text>
</TouchableOpacity>

<TouchableOpacity onPress={()=>router.replace('auth/sign-up')} style={styles.buttonSignUp}>
<Text style={styles.buttonTextSignUp}>Register an account</Text>
</TouchableOpacity>


</View>
</SafeAreaView>
)
}

  const styles = StyleSheet.create({
    container:{
        backgroundColor: 'white',
        height:'100%' ,
    },

    topVectorContainer:{
        height: 20 ,
    },

    topVector:{
        width: '100%',
        height: 100 ,
    },

    bottomVectorContainer:{
        height:20,
        flex: 1,
        flexDirection: 'row-reverse' ,
        alignItems: 'flex-end'
    },


    subheader:{
        fontFamily:'montserrat',
        padding: 5,
        marginTop: 60,
        fontSize: 40,
        color:Colors.verydarkblue,
        textAlign: 'center' ,
    },

    inputContainer1:{
        marginTop:40,
        alignSelf:'center',
    },

    inputContainer2:{
        marginTop:15,
        alignSelf:'center'
    },

    input:{
        padding: 10 ,
        borderWidth: 2 ,
        borderColor: 'transparent' ,
        backgroundColor: 'white' ,
        width: 350 ,
        height: 50 ,
        borderRadius: 30 ,
        elevation: 20 ,
    },

    placeholder:{
        fontFamily: 'montserrat' ,
        fontSize: 20 ,
        marginBottom: 10 ,
    },

    buttonSignIn:{
        alignSelf: 'center' ,
        marginTop:30 ,
        padding: 12 ,
        backgroundColor: '#65558f' ,
        borderRadius: 30 ,
        width: 320 ,
        height: 45 ,
        elevation: 20,
    },

    buttonTextSignIn:{
        color:'white',
        textAlign: 'center' ,
    },

    buttonSignUp:{
        marginTop:10,
        padding:20,

    },

    buttonTextSignUp:{
        color:Colors.primary,
        textAlign:'center',
        fontFamily: 'montserrat',
    }
})