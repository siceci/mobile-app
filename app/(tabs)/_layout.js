import { View, Text, Image, StyleSheet } from 'react-native';
import {Tabs, Redirect} from 'expo-router';
import FontSizeContext from '../components/FontSizeContext';
import {icons} from '../../constants';
import React, {useContext} from 'react';

//react funcitonal componement 
const TabIcon = ({icon, color, name, focused}) => {
    const { fontSize, setFontSize } = useContext(FontSizeContext);
    const parsedFontSize = parseFloat(fontSize); // 将 fontSize 转换为数字
    const newFontSize = parsedFontSize - 3; 
    return (
        <View className="items-center justify-center">
            <Image
                source ={icon}
                resizeMode="contain"
                tintColor={color} 
                className="w-8 h-8"
            />
            <Text className={`${focused ? 'font-semibold' : 'font-pregular'}`}
            style={{...styles.text, fontSize: `${newFontSize}rem`, color}}
            >
                {name}

            </Text>
        </View>
    )

}
const TabsLayout = () => {
  return (
    <>
        <Tabs
        screenOptions={{
            tabBarShowLabel:false,
            //the color icon that when u stay in the that tab
            tabBarActiveTintColor : '#fff7ed',
            tabBarInactiveTintColor : '#1e3932', //inactive
            tabBarStyle: {
                backgroundColor: '#14b8a6', //Green
                // borderTopWidth: 1,
                // borderTopColor: '#1e3932', //Dark Green
                height: 95,
            }
        }}>

        {/* Bookmark section */}
        <Tabs.Screen 
        name="bookmark"
        options={{
            title: 'Calendar',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.calendar}
                    color={color}
                    name="Calendar"
                    focused={focused}
                />
            )
        }}
        />

        {/* Create section */}
        <Tabs.Screen 
        name="create"
        options={{
            title: 'About',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.about}
                    color={color}
                    name="About"
                    focused={focused}
                />
            )
        }}
        />

        {/* Setting section */}
        <Tabs.Screen 
        name="profile"
        options={{
            title: 'Setting',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.setting}
                    color={color}
                    name="Setting"
                    focused={focused}
                />
            )
        }}
        />

        </Tabs>
    </>
  )
}
const styles = StyleSheet.create({

  });

export default TabsLayout