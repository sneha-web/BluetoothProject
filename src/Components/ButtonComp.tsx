import { StyleSheet, Text, TouchableOpacity,GestureResponderEvent, View } from 'react-native'
import React from 'react';

interface CustomBottonProps{
    title:string,
    onPress : (event: GestureResponderEvent ) => void,
    disable:boolean
}

const ButtonComp:React.FC<CustomBottonProps> = ({onPress,title,disable}) => {
  return (
    <TouchableOpacity
    onPress={onPress}
    style={styles.button}
    disabled={disable}
    >
     <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
  )
}

export default ButtonComp

const styles = StyleSheet.create({
    button : {
        width:"85%",
        height:"10%",
        marginVertical:15,
        borderRadius:20,
        backgroundColor:"rgba(0, 150, 255, 0.3)",
        justifyContent:"center",
        alignContent:"center",
        alignSelf:"center"
    },
    buttonText:{
        fontSize:22,
        fontWeight:"700",
        alignSelf:"center"
    }
})