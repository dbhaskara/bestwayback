import json
from pprint import pprint
import pyrebase

#Configure the firebase connection
config = {
    'apiKey': "AIzaSyBhwIqzdAMMzEPOciWo3RnWIV1mDkSCTSI",
    'authDomain': "best-way-back.firebaseapp.com",
    'databaseURL': "https://best-way-back.firebaseio.com",
    'projectId': "best-way-back",
    'storageBucket': "best-way-back.appspot.com",
  };
firebase = pyrebase.initialize_app(config)
db = firebase.database()

#Print contents of database
#users = db.child("users").get()
#pprint(users.val())

#Add each json item to the database
with open('crimes.json') as data_file:    
    data = json.load(data_file)

print('Adding ' + str(len(data)) + 'crime incidents to database...')

for crime in data:
	crime = data[0]

	entry = {'date': crime['date'], 
		'primary_type': crime['primary_type'], 
		'arrest': crime['arrest'],
		'year': crime['year'],
		'description': crime['description'],
		'location_description' : crime['location_description'],
		'district': crime['district'],
		'longitude': crime['location']['longitude'], 
		'latitude': crime['location']['latitude']
		}

	db.child("users").push(entry)


