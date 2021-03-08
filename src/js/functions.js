// Rendering the element or removing it from the screen smoothly - with animations
// The element must have 3 CSS Classes available - hidden class, visible class, hiding class
// Hidden class - display: none, no animation
// Visible class - display: block (or whatever except none) and an animation of the element appearing on the page (sliding -in or so)
// Hiding class - animation of the element disappearing
// Element has only one of these classes at a time.
// The hiding class is changed to hidden class after 'animationend' event on the element
export const showOrHideEl = (element, hiddenClass, visibleClass, hidingClass) => {
    if([...element.classList].includes(hiddenClass)) {

        element.classList.remove(hiddenClass);
        element.classList.add(visibleClass);

    } else {

        element.classList.remove(visibleClass);
        element.classList.add(hidingClass);

        const animationEndHandler =  function(event) {
        if(event.pseudoElement) {
            element.addEventListener('animationend', animationEndHandler,  {
            capture: false,
            once: true,
            passive: false
            });
            return;
        }

        element.classList.remove(hidingClass);
        element.classList.add(hiddenClass);

        }

        element.addEventListener('animationend', animationEndHandler, {
        capture: false,
        once: true,
        passive: false
        });
    }
}

// Renders map to an element with id 'map'
export function createMap(lng, lat) {
    
    const pos = {'lat': lat, 'lng': lng};
    
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: pos
    });
    
    const marker = new google.maps.Marker({
      position: pos,
      map: map
    });
   
  } 

// Sends request to Google Geocoding API and returns coords for the sent address
export const getCoordsFromAddress = async (address) => {

    // Encoding address for URL usage
    const urlAddress = encodeURI(address);

    // Sending request
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${urlAddress},+Mountain+View,+CA&key=AIzaSyCY18WNxfuJuAUAornOSKyC3m76a6E2SfA`);
    //Parsing
    const data = await response.json();
    console.log(data);

    // Returning coords for the best result
    const coordinates = data.results[0].geometry.location;

    if(!coordinates) {
        throw new Error('Getting the coords from google geocoding API failed');
    }

    return coordinates;
}

// Converting kilometers to deg (1 deg means cca 111km)
export const convertKmToDeg = kilometers => kilometers/111;

// Switching input whenever the user chooses his preferable input option by adding and removing hidden classes
export const changeInputType = (firstInputSet, secondInputSet, checkfor , e) => {

    if (e.target.value === checkfor) {
        firstInputSet.classList.remove('hidden');
        secondInputSet.classList.add('hidden');
       
    } else {
        firstInputSet.classList.add('hidden');
        secondInputSet.classList.remove('hidden');
    }

}

// Getting coordinates from the user input
export const getCoords = async (addressRadio, formEls) => {

    let lng;
    let lat;

    // If !adressRadio.checked = if the user has selected coords for getting address
    if(!addressRadio.checked) {

        // Getiting coords from the coords input
        lng = +formEls['coord-long'].value;
        lat = +formEls['coord-lat'].value;

    } else {

        //Getting address from the address input 
        const address = formEls['address'].value;

        // Sending request to the Google Geocoding API and geting coords for the address
        try {
            const coords = await getCoordsFromAddress(address);

            lng = coords.lng;
            lat = coords.lat;

        } catch (err) {
            throw new Error(err);
        }
       
    }

    return [lng, lat];
}

export const calculateCoordTransform = (circleRadio, formEls, coords) => {

    const [lat, lng] = coords;

    let range;
    let randomDist;

    // Selecting random angle
    const randomAngle  = Math.random() * 2 * Math.PI

    //If circleRadio.checked = if the user has choosen the circle
    if(circleRadio.checked) {

        // Selecting random distance from base in the selected circle range
        range = +formEls['circle-perimeter'].value;
        randomDist = range * Math.random();
        
    } else {

        // Selecting random distance from base in the selected annulus range
        range = +formEls['annulus-perimeter-outer'].value - +formEls['annulus-perimeter-inner'].value;
        randomDist = +formEls['annulus-perimeter-inner'].value + range * Math.random();

    }

    // Getting the offset from base latitude and base longitude in kilometers
    const moveLngKm = Math.sin(randomAngle)*randomDist;
    const moveLatKm = Math.cos(randomAngle)*randomDist;

    // Converting to degrees
    const moveLng = convertKmToDeg(moveLngKm);
    const moveLat = convertKmToDeg(moveLatKm);

    // Applying the offset
    const finalLng = lng + moveLng;
    const finalLat = lat + moveLat;

    return [finalLat, finalLng];

}

// Adds invalid class if the input isnt valid, returns true || false , depending on if the input is valid or not
export const validateInput = (input, formEls) => {

    // Returning if the input type is radio
    if(input.type === 'radio') {
        return;
    }

    let valid;

    // If the input is address, checking if it is not an empty string
    // If the input is not address, checking, if the input value is a number 
    if(input === formEls['address']) {
        valid = input.value.trim();
    } else {
        const numberRegex = /^[0-9]+(\.[0-9])*$/;
        valid = numberRegex.test(input.value);
    }

    // Adding invalid class if the input is invalid, removing it, if the input is not
    if (valid) {
        input.classList.remove('invalid');
    } else {
        input.classList.add('invalid');
    }

    return valid;
}

// Validates all inputs, that are required to create map. Takes into account, which inputs has user selected. Returns false, when at least one of the required inputs is invalid.
export const validateNeeded = (addressRadio, circleRadio, formEls) => {


    let validateList = [];

    // Adding address to validateList, if the user has chosen address. If not, adding coords to validateList
    if (addressRadio.checked) {
        validateList.push(formEls['address']);
    } else {
        validateList.push(formEls['coord-long']);
        validateList.push(formEls['coord-lat']);
    }

    //Adding circle-perimeter to validateList, if the user has chosen circle. If not, adding annulus-perimeter-outer and annulus-perimeter-inner to validateList.
    if (circleRadio.checked) {
        validateList.push(formEls['circle-perimeter']);
    } else {
        validateList.push(formEls['annulus-perimeter-outer']);
        validateList.push(formEls['annulus-perimeter-inner']);
    }

    let valid = true;

    // Validating every input that is listed on validateList. If any of the inputs is invalid, setting valid to false, which signifies, that the validation has failed.
    for (const input of validateList) {
        
        const isInputValid = validateInput(input, formEls);

        if(!isInputValid) {
            valid = false;
        }

    }

    return valid;
}

// Shows error in a div with id 'error'
export const showError = (msg) => {
    
    const errorDiv = document.getElementById('error'); 
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';

}
