import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native';

export default function Login() {

    const router=useRouter();
  return (
    <View>
      <Image source={require('./../assets/images/Eventify.png')}
      style={{
        width:"100%",
        backgroundColor:Colors.lightorange,
        height:250,
        marginTop:'10%'
      }}
      />
      <View style={styles.container}>
        <Text style={{
            fontSize: 28,
            textAlign:'center',
            color:Colors.verydarkblue
        }}>Group 6</Text>
        <TouchableOpacity style={styles.button}
            onPress={()=>router.push('auth/sign-in')}
        >
            <Text style={{
                fontSize: 20,
                textAlign:'center',
                color:Colors.white
            }}>Login or Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
    container:{
        backgroundColor: Colors.lightorange,
        marginTop: -1,
        height:'100%',
        padding:30
    },
    button:{
        padding:15,
        backgroundColor: Colors.verydarkblue,
        borderRadius:99,
        marginTop:'25%'
    }
})