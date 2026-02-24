import {View,Text,StyleSheet} from "react-native";
import React from "react";

const DashboardScreen = () => {
    return (
        <View style={styles.container}>
            <Text> Dashboard Screen</Text>
            
        </View>
    )
}

export default DashboardScreen;

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    }
})