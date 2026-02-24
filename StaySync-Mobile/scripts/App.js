import {StyleSheet} from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import AboutScreen from "../screens/AboutScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from "@react-navigation/native";
import {Ionicons} from "@expo/vector-icons";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {registerRootComponent} from "expo";


const Drawer=createDrawerNavigator();
const Tab=createBottomTabNavigator();

const App=()=>{
    return(
        <NavigationContainer>
            <Drawer.Navigator>
                <Drawer.Screen name="Dashboard" component={DashboardScreen}></Drawer.Screen>
                <Drawer.Screen name="About" component={AboutScreen}></Drawer.Screen>
                <Drawer.Screen name="Profile" component={ProfileScreen}></Drawer.Screen>
                <Drawer.Screen name="Settings" component={SettingsScreen}></Drawer.Screen>
            </Drawer.Navigator>
        </NavigationContainer>
    )
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#fff"
    }
})

registerRootComponent(App);
