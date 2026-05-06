import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { MobileCredentials } from "../mobileTypes";

interface LoginScreenProps {
  onSubmit: (credentials: MobileCredentials) => void;
}

export function LoginScreen({ onSubmit }: LoginScreenProps) {
  const [userName, setUserName] = useState("supervisor.demo");
  const [password, setPassword] = useState("demo");
  const [deviceName, setDeviceName] = useState("Shopfloor Tablet 01");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>STS Manufacturing ERP</Text>
        <Text style={styles.title}>Sign in for execution</Text>
        <Text style={styles.copy}>Use mobile for job actions, material scans, QC checkpoints, proof capture, and offline-safe submissions.</Text>

        <TextInput accessibilityLabel="Mobile user name" onChangeText={setUserName} style={styles.input} value={userName} />
        <TextInput accessibilityLabel="Mobile password" onChangeText={setPassword} secureTextEntry style={styles.input} value={password} />
        <TextInput accessibilityLabel="Device name" onChangeText={setDeviceName} style={styles.input} value={deviceName} />

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onSubmit({ userName, password, deviceName })}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Bind device and sign in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffaf2",
    borderRadius: 30,
    gap: 14,
    padding: 24
  },
  copy: {
    color: "#5c6f68",
    fontSize: 15,
    lineHeight: 22
  },
  eyebrow: {
    color: "#9b4d1a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 18,
    borderWidth: 1,
    color: "#10251f",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  primaryButton: {
    backgroundColor: "#17463a",
    borderRadius: 20,
    padding: 16
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  safe: {
    backgroundColor: "#fbf7ef",
    flex: 1,
    justifyContent: "center",
    padding: 18
  },
  title: {
    color: "#10251f",
    fontSize: 30,
    fontWeight: "900"
  }
});
