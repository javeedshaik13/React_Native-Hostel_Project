import {View,Text,StyleSheet,Dimensions} from "react-native";
import {useEffect,useState,useRef} from "react";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;

const CreatePostScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Create Post Screen</Text>
        </View>
    );
};

export default CreatePostScreen;

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    }
});


