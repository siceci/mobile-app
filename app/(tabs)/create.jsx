import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext } from 'react';
import FontSizeContext from '../components/FontSizeContext';
import licenses from '../../licenses.json';

const Create = () => {
  const { fontSize } = useContext(FontSizeContext);

  return (
    <SafeAreaView className="bg-orange-50 h-full">
      <ScrollView>
        <View className="w-full justify-top mt-4 px-4">
          <View className="mb-4">
            <Text className="text-4xl font-bold text-emerald-900 mb-2">
              About
            </Text>
            <Text className="font-semibold mt-2" style={[styles.text, { fontSize }]}>
              Application Name:
            </Text>
            <Text style={[styles.text, { fontSize }]}>
              MyTask
            </Text>
            <Text className="font-semibold mt-2" style={[styles.text, { fontSize }]}>
              Version:
            </Text>
            <Text style={[styles.text, { fontSize }]}>
              1.0.0
            </Text>
            <Text className="font-semibold mt-2" style={[styles.text, { fontSize }]}>
              Application Features:
            </Text>
            <Text style={[styles.text, { fontSize }]}>
              This app aims to help users to list and manage tasks.
            </Text>
            <Text className="font-semibold mt-2" style={[styles.text, { fontSize }]}>
              Development Background:
            </Text>
            <Text style={[styles.text, { fontSize }]}>
              Enhance users' productivity with this app, making task management simpler.
            </Text>
            <Text className="font-semibold mt-2" style={[styles.text, { fontSize }]}>
              Developer:
            </Text>
            <Text style={[styles.text, { fontSize }]}>
              Ceci Tang
            </Text>
            <Text className="font-semibold mt-2" style={[styles.text, { fontSize }]}>
              Contact Information:
            </Text>
            <Text style={[styles.text, { fontSize }]}>
              Email: n11598949@qut.edu.au
            </Text>
          </View>
          <Text className="font-semibold mt-2 -mb-1.5" style={[styles.text, { fontSize }]}>
          Open Source Licenses:
          </Text>
          {licenses.map((license, index) => (
              <View key={index}>
                <Text className="font-medium mt-2" style={[styles.text, { fontSize }]}>Module Name:</Text>
                <Text style={[styles.text, { fontSize }]}>{license["module name"]}</Text>
                <Text className="font-medium" style={[styles.text, { fontSize }]}>License:</Text>
                <Text style={[styles.text, { fontSize }]}>{license.licenses}</Text>
                <Text className="font-medium" style={[styles.text, { fontSize }]}>Repository:</Text>
                <Text style={[styles.text, { fontSize }]}>{license.repository}</Text>
              
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text: {
   
  },
});

export default Create;
