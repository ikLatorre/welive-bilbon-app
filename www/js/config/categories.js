
/**
* @desc Configuration of official and no official datasets (of the Open Data Stack). 
* 
*   Each official dataset corresponds to one category (identified by dataset ID and json ID). They're
* specified by 'isOfficial' property. If 'jsonId' property is 'null' for an official dataset, this 
* category will be used only for citizens (there is no official data for that category, and the
* specified datasetId is used only for citizens' dataset's 'category' field, it doesn't exist
* in the WeLive's Open Data Stack but is necessary to specify it).
*
*   All the citizens' POIs are stored in the same dataset/resource (each one has the 'category' field,
* which content matches the official dataset's ID of the corresponding category).
*   (E.g.: for restaurants,... the official POIs are stored in the dataset which ID is 
* 'restaurantes-sidrerias-y-bodegas-de-euskadi', and the citizen's are stored in 'bilbon-user-pois' dataset
* ('4df0b281-9093-4373-a8af-97af59aa86ed' resource) with 'restaurantes-sidrerias-y-bodegas-de-euskadi' in the 'category field'.)
* 
*   The citizens' datasets' ID is "bilbon-user-pois", and contains POIs of different categories.
* In this case is necessary to specify 'categoryCustomNumericId' property, e.g. to associate POIs of a concrete
* category to its corresponding icons, or to manage POI data when one is created by a citizen.
*   'categoryCustomNumericId' property is used in this app to manage categories in the same way, because official
* POIs are separated in different datasets and citizens' POIs are all in the same dataset.
* 'es_ES', 'eu_ES' and 'en_EN' parameters are used to show those categories' in the sidemenu's filter as labels
* (so it isn't necessary to specify those labels in citizen's items, they're unused).
*
*   There can not be two items with the same 'categoryCustomNumericId' + 'isOfficial' properties.
* ('id' property's range must be 0..N, because they're used as array index in the app)
*/
var categories = [
	// Existing official POIs. Each one corresponds to one category.
	{
		"id": 0, 
		"datasetId": "restaurantes-sidrerias-y-bodegas-de-euskadi", 
		"jsonId": "08560d52-c8ca-484b-9797-13309f056564", 
		"categoryCustomNumericId": 1,
		"es_ES": "Restaurantes, sidrerías y bodegas", 
		"eu_ES": "Jatetxe, sagardotegi eta upeltegiak", 
		"en_EN": "Restaurants, cider bars and wineries",
		"marker": "img/categories_icons/gastronomy.png",
		"isOfficial": true 
	},
	{
		"id": 1, 
		"datasetId": "oficinas-de-turismo-de-euskadi", 
		"jsonId": "94537200-5d08-44ce-a366-c6075ddff6a2",
		"categoryCustomNumericId": 2,
		"es_ES": "Oficinas de turismo", 
		"eu_ES":"Turismo bulegoak", 
		"en_EN": "Tourism offices",
		"marker": "img/categories_icons/tourism.png",
		"isOfficial": true 
	},
	{
		"id": 2, 
		"datasetId": "alojamientos-turisticos-de-euskadi", 
		"jsonId": "78a18256-cfba-4f51-825f-7e2e0f48b822", 
		"categoryCustomNumericId": 3,
		"es_ES": "Alojamientos turísticos", 
		"eu_ES": "Ostatu turistikoak", 
		"en_EN": "Tourist accommodations",
		"marker": "img/categories_icons/accommodation.png" ,
		"isOfficial": true 
	},
	// Nonexistent official POIs (the 'datasetId' doesn't exist, and 'jsonId' is 'null') (used only for citizens, 
	// where 'datasetID' is the 'category' field of the "citizens' POIs" dataset)
	{
		"id": 3, 
		"datasetId": "paradas-de-taxi-de-euskadi", 
		"jsonId": null, 
		"categoryCustomNumericId": 4,
		"es_ES": "Paradas de taxi", 
		"eu_ES": "Taxi geltokiak", 
		"en_EN": "Taxi stops",
		"marker": "img/categories_icons/taxi-stop.png" ,
		"isOfficial": true 
	},
	{
		"id": 4, 
		"datasetId": "farmacias-de-euskadi", 
		"jsonId": null, 
		"categoryCustomNumericId": 5,
		"es_ES": "Farmacias", 
		"eu_ES": "Farmaziak", 
		"en_EN": "Pharmacies",
		"marker": "img/categories_icons/pharmacy.png" ,
		"isOfficial": true 
	},
	{
		"id": 5, 
		"datasetId": "museos-de-euskadi", 
		"jsonId": null, 
		"categoryCustomNumericId": 6,
		"es_ES": "Museos", 
		"eu_ES": "Museoak", 
		"en_EN": "Museums",
		"marker": "img/categories_icons/museum.png" ,
		"isOfficial": true 
	},




	// Citzens' POIs (all of them are stored in the same dataset, diferentiated in the corresponding table
	// by 'category' field, which matches the official category's 'datasetId').
	{
		"id": 6, 
		"datasetId": "bilbon-user-pois", 
		"jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
		"categoryCustomNumericId": 1,
		"es_ES": null, 
		"eu_ES": null, 
		"en_EN": null,
		"marker": "img/categories_icons/gastronomy_citizen.png",
		"isOfficial": false 
	},
	{
		"id": 7, 
		"datasetId": "bilbon-user-pois",
		"jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
		"categoryCustomNumericId": 2, 
		"es_ES": null, 
		"eu_ES": null, 
		"en_EN": null,
		"marker": "img/categories_icons/tourism_citizen.png",
		"isOfficial": false 
	},
	{
		"id": 8, 
		"datasetId": "bilbon-user-pois", 
		"jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
		"categoryCustomNumericId": 3,
		"es_ES": null, 
		"eu_ES": null,
		"en_EN": null, 
		"marker": "img/categories_icons/accommodation_citizen.png",
		"isOfficial": false 
	},

	{
		"id": 9, 
		"datasetId": "bilbon-user-pois", 
		"jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
		"categoryCustomNumericId": 4,
		"es_ES": null, 
		"eu_ES": null,
		"en_EN": null, 
		"marker": "img/categories_icons/taxi-stop_citizen.png",
		"isOfficial": false 
	},
	{
		"id": 10, 
		"datasetId": "bilbon-user-pois", 
		"jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
		"categoryCustomNumericId": 5,
		"es_ES": null, 
		"eu_ES": null,
		"en_EN": null, 
		"marker": "img/categories_icons/pharmacy_citizen.png",
		"isOfficial": false 
	},
	{
		"id": 11, 
		"datasetId": "bilbon-user-pois", 
		"jsonId": "4df0b281-9093-4373-a8af-97af59aa86ed", 
		"categoryCustomNumericId": 6,
		"es_ES": null, 
		"eu_ES": null,
		"en_EN": null, 
		"marker": "img/categories_icons/museum_citizen.png",
		"isOfficial": false 
	}
];