/**
 * tasks package
 */

import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Keyboard,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import * as UserActions from '../../redux/user/actions';

// import { Icon } from 'react-native-elements';

import Application from '../../constants/config';
import { Alerts } from '../../components/ui/';
import { AppColors } from '../../theme/';
import Network from '../../network';

const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const namePattern = /^[a-zA-Z. ]{3,20}$/;
const unamePattern = /^[a-zA-Z.]{3,20}$/;
const passPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'OpenSans-Regular',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '400',
    marginTop: 15,
  },
  inputLabel: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
    marginTop: 15,
  },
  inputStyle: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    height: 40,
    backgroundColor: '#FFF',
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    paddingHorizontal: 10,
    color: '#000',
  },
  errorMessage: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 13,
    color: '#ff5132',
    marginTop: 5,
  },
  signup: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
});

export default class Register extends Component {
  constructor(props) {
    super(props);
    this._net = new Network();
    // console.log('RegCB1');
    this.state = {
      inputName: '',
      inputEmail: '',
      inputPass: '',
      inputUsername: '',
      alert: {
        status: '',
        success: '',
        error: '',
      },
      inputError: {
        name: false,
        email: false,
        password: false,
        username: false,
      },
      setUsername: false,
    };
  }

  validateRegistrationForm = () => {
    if (this.state.inputName.length > 0 &&
      this.state.inputEmail.length > 0 &&
      this.state.inputPass.length > 0
    ) {
      this.setState({ alert: { status: 'Please wait...' } });
    }
    const errorStates = {};
    if (!namePattern.test(this.state.inputName)) {
      errorStates.name = true;
    }
    if (!emailPattern.test(this.state.inputEmail)) {
      errorStates.email = true;
    }
    if (!passPattern.test(this.state.inputPass)) {
      errorStates.password = true;
    }
    this.setState({ inputError: errorStates });
    if (namePattern.test(this.state.inputName) &&
      emailPattern.test(this.state.inputEmail) &&
      passPattern.test(this.state.inputPass)) {
      this._net.service.registerUser(this.state.inputEmail,
      this.state.inputPass, this.state.inputName, (err, res) => {
        // console.log('RegCB', err, res);
        if (err && !res) {
          this.setState({ alert: { error: 'Error in registration!' } });
        }
        this.setState({ alert: { success: 'Registration successful!' } });
        UserActions.loginAfterRegister({
          username: this.state.inputEmail,
          password: this.state.inputPass,
        }, () => {
          // console.log('RegCB 01', lerr, lres);
          if (this._net.service.loggedInUser && this._net.service.loggedInUser.username) {
            Actions.app({ type: 'reset' });
          } else {
            this.setState({ setUsername: true, alert: { success: '' } });
            this._net.service.getUsernameSuggestion((Uerr, Ures) => {
              if (Uerr) {
                this.setState({ alert: { error: 'Error fetching username!' } });
              } else if (Ures) {
                this.setState({ inputUsername: Ures });
              }
            });
          }
        });
      });
    } else {
      this.setState({ alert: { error: 'Enter valid details' } });
    }
  }

  renderRegistration = () => {
    const { height } = Dimensions.get('window');
    if (!this.state.setUsername) {
      return (
        <View
          style={{
            flex: 1,
            zIndex: 100,
          }}
        >
          <ScrollView style={{
            flexDirection: 'column',
            backgroundColor: AppColors.brand().third,
          }}
          >
            <KeyboardAvoidingView
              behavior={(Platform.OS === 'ios') ? 'position' : null}
              style={{ paddingVertical: 15, paddingHorizontal: 30 }}
            >
              <View style={{
                height: height / 3,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingVertical: 15,
              }}
              >
                <Image
                  source={Application.logo}
                  style={{ width: 250, height: 50 }}
                />
                <Text style={styles.titleText}>Create a new account</Text>
              </View>
              <Alerts
                status={this.state.alert.status}
                success={this.state.alert.success}
                error={this.state.alert.error}
              />
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                placeholder={'Your name'}
                onChangeText={inputName => this.setState({ inputName })}
                value={this.state.name}
                autoCorrect={false}
                clearButtonMode={'while-editing'}
                autoCapitalize="none"
                disableFullscreenUI
                style={styles.inputStyle}
              />
              {
                this.state.inputError.name &&
                <Text style={styles.errorMessage}>Please enter a valid name</Text>
              }
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder={'you@domain.com'}
                onChangeText={inputEmail => this.setState({ inputEmail })}
                autoCorrect={false}
                value={this.state.email}
                keyboardType="email-address"
                clearButtonMode={'while-editing'}
                autoCapitalize="none"
                disableFullscreenUI
                style={styles.inputStyle}
              />
              {
                this.state.inputError.email &&
                <Text style={styles.errorMessage}>Please enter a valid email</Text>
              }
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder={'Create a new password'}
                onChangeText={inputPass => this.setState({ inputPass })}
                value={this.state.password}
                secureTextEntry
                autoCorrect={false}
                clearButtonMode={'while-editing'}
                autoCapitalize="none"
                disableFullscreenUI
                style={styles.inputStyle}
              />
              {
                this.state.inputError.password &&
                <Text style={styles.errorMessage}>Please enter a stronger password</Text>
              }
              <TouchableOpacity
                style={[styles.signup, { backgroundColor: AppColors.brand().res_signBg }]}
                onPress={() => {
                  Keyboard.dismiss();
                  this.validateRegistrationForm();
                }}
              >
                <Text style={{
                  marginLeft: 10,
                  color: '#FFF',
                  fontSize: 16,
                  fontWeight: '400',
                }}
                >Sign up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 30,
                }}
                onPress={() => {
                  Actions.pop();
                }}
              >
                <Text style={{
                  marginLeft: 10,
                  color: '#FFF',
                  fontSize: 16,
                  fontWeight: '400',
                }}
                >Cancel</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </ScrollView>
        </View>
      );
    }
  }

  renderSetUsername = () => {
    const { height } = Dimensions.get('window');
    if (this.state.setUsername) {
      return (
        <View
          style={{
            flex: 1,
            zIndex: 100,
          }}
        >
          <ScrollView style={{
            flexDirection: 'column',
            backgroundColor: AppColors.brand().third,
          }}
          >
            <KeyboardAvoidingView
              behavior={(Platform.OS === 'ios') ? 'position' : null}
              style={{ paddingVertical: 15, paddingHorizontal: 30 }}
            >
              <View style={{
                height: height / 3,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingVertical: 15,
              }}
              >
                <Image
                  source={Application.logo}
                  style={{ width: 250, height: 50 }}
                />
                <Text style={styles.titleText}>Choose your username</Text>
              </View>
              <Alerts
                status={this.state.alert.status}
                success={this.state.alert.success}
                error={this.state.alert.error}
              />
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                placeholder={'Your username'}
                onChangeText={inputUsername => this.setState({ inputUsername })}
                value={this.state.inputUsername}
                autoCorrect={false}
                clearButtonMode={'while-editing'}
                autoCapitalize="none"
                disableFullscreenUI
                style={styles.inputStyle}
              />
              {
                this.state.inputError.name &&
                <Text style={styles.errorMessage}>Please enter a valid username</Text>
              }
              <TouchableOpacity
                style={[styles.signup, { backgroundColor: AppColors.brand().res_signBg }]}
                onPress={() => {
                  Keyboard.dismiss();
                  const errorStates = {};
                  if (!unamePattern.test(this.state.inputUsername)) {
                    errorStates.username = true;
                    this.setState({ inputError: errorStates });
                  } else if (unamePattern.test(this.state.inputUsername)) {
                    this._net.service.setUsername(this.state.inputUsername, (err, res) => {
                      // console.log('another', err, res);
                      if (err && !res) {
                        this.setState({ alert: { error: 'Try another username!' } });
                      } else {
                        Alert.alert(
                          'Success',
                          'Please login with your username and password.',
                          [
                            { text: 'OK',
                              onPress: () => {
                                this._net.logout();
                              },
                            },
                          ],
                          { cancelable: false },
                        );
                      }
                    });
                  }
                }}
              >
                <Text style={{
                  marginLeft: 10,
                  color: '#FFF',
                  fontSize: 16,
                  fontWeight: '400',
                }}
                >Set username</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </ScrollView>
        </View>
      );
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          zIndex: 100,
        }}
      >
        {this.renderRegistration()}
        {this.renderSetUsername()}
      </View>
    );
  }
}
