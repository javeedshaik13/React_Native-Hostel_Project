import {View,Text,StyleSheet} from "react-native";
import React from "react";


const SettingsScreen = () => {
    

    useEffect(()=>{
        // Fetch user settings from backend API
        const fetchUserSettings = async () => {
            try {
                const response = await fetch("https://
    return (
        <View style={styles.container}>
            <Text> Settings Screen</Text>

            
        </View>
    )
}

export default SettingsScreen;

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    }
})