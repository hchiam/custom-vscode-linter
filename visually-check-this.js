// for now, use this file to visually check that the extension works as expected

if (ID) { // YES
  alert('hi');
}
if (a.clientID && hi) { // YES
  alert('hi');
}

if (ID != 0) { // NO
  alert('hi');
}

if (ID == 0) { // NO
  alert('hi');
}

if (a.myId || what) { // YES
  alert('hi');
} else if (hey || what) { // NO
  alert()
} else if (a.myId == 1 || why) { // NO
  alert('hi');
} else if (other && a.myId > 0 || why) { // NO
  alert('hi');
}


if (hiIDa.clientIdExists) { // NO
  alert('hi');
}

if (hiID.clientId) { // YES
  alert('hi');
}

if (hiIDa.clientId) { // YES
  alert('hi');
}

if (hiID.clientIda) { // NO
  alert('hi');
}

if (hiIDa.clientIda) { // NO
  alert('hi');
}

if (hiIDa.clientId == 1) { // NO
  alert('hi');
}

if (a = 1) { // YES
  alert('hi');
} else if (a = 1) { // YES
  alert('bye');
}

if (b = 1) { // YES
  alert('hi');
} else if (a = 1) { // YES
  alert('bye');
}

function name(params) {
  $http.get('some/url').then(function(res) { // YES

  });
}

console.log('hi'); // YES

AS
BEGIN // YES

AS

BEGIN // YES

AS--WITH ENCRYPTION
BEGIN
--comment: sp_password // NO

AS--WITH ENCRYPTION
BEGIN
 // YES

// NO:
AS--WITH ENCRYPTION

BEGIN

  -- comment: sp_password

AS--WITH ENCRYPTION
BEGIN
	--comment: sp_password // NO

Number(someOkThing); // NO
Number(someID); // YES
Number(something.someId); // YES
Number(something.someID); // YES

getNumber(something.someId || somethingElse.someOtherId); // NO

if (!equipmentId) {} // YES

Number(someId || -1) // NO
Number(-1 || someId) // NO

if (!someID) { // YES

}

// TODO // YES
//TODO:// YES
-- TODO: // YES
--TODO // YES
