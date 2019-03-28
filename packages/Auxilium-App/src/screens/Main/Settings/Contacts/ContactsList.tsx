import React from 'react';
import {
	View,
	SafeAreaView,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	Dimensions
} from 'react-native';
import { SQLite } from 'expo';
import { Feather } from '@expo/vector-icons';
import { NavigationScreenProps } from 'react-navigation';
import { Contact } from './components';
import { ThemeConsumer } from '../../../../context';

interface ContactsState {
	contacts: {
		name: string;
		phone: string;
	}[];
}

const { width } = Dimensions.get('window');

const db = SQLite.openDatabase('contacts');

class ContactsPage extends React.Component<
	NavigationScreenProps,
	ContactsState
> {
	state: ContactsState = {
		contacts: []
	};

	componentDidMount() {
		this.loadContacts();
	}

	loadContacts = () => {
		db.transaction((tx: any) => {
			tx.executeSql(
				`CREATE TABLE IF NOT EXISTS contacts (name text, phone text );`
			);
			tx.executeSql(
				`SELECT * from contacts;`,
				null,
				(_, { rows: { _array } }) => {
					this.setState({ contacts: _array });
				}
			);
		});
	};

	createContact = async (name: string, phone: string) => {
		await db.transaction((tx: any) => {
			tx.executeSql('INSERT INTO contacts (name, phone) values (?, ?);', [
				name,
				phone
			]);
		});
		this.loadContacts();
	};

	deleteContact = async (name: string) => {
		// TODO: Use function to delete contacts in the contacts component
		await db.transaction((tx: any) => {
			tx.executeSql('DELETE FROM contacts WHERE name = ?;', [name]);
		});
		this.loadContacts();
	};

	render() {
		const { contacts } = this.state;
		const { navigation } = this.props;
		return (
			<ThemeConsumer>
				{({ theme }) => (
					<SafeAreaView
						style={[
							styles.container,
							{ backgroundColor: theme.backgroundColor }
						]}
					>
						<TouchableOpacity
							style={styles.backButton}
							onPress={() => navigation.pop()}
						>
							<Feather name='arrow-left' color={theme.textColor} size={35} />
						</TouchableOpacity>
						<FlatList
							contentContainerStyle={{ flex: 1, alignItems: 'center' }}
							data={contacts}
							renderItem={({ item: { name, phone } }) => (
								<Contact
									{...{ name, phone, deleteContact: this.deleteContact }}
								/>
							)}
							keyExtractor={(_, index) => index.toString()}
							ListFooterComponent={() => (
								<TouchableOpacity
									onPress={() =>
										navigation.navigate('AddContact', {
											onSubmit: this.createContact
										})
									}
								>
									<View style={styles.mainButton}>
										<Feather
											name='plus-circle'
											color={theme.textColor}
											size={20}
										/>
										<Text
											style={[
												styles.mainButtonText,
												{ color: theme.textColor }
											]}
										>
											Add Contact
										</Text>
									</View>
								</TouchableOpacity>
							)}
						/>
					</SafeAreaView>
				)}
			</ThemeConsumer>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	backButton: {
		padding: 10
	},
	mainButton: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		width: width * 0.6,
		height: 45,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		borderRadius: 22.5
	},
	mainButtonText: {
		fontFamily: 'Muli Regular',
		fontSize: 16,
		textTransform: 'uppercase'
	}
});

export default ContactsPage;
