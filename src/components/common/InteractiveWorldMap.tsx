"use client";

import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Thermometer
} from "lucide-react";

// World map topology data
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export interface CountryData {
  id: string;
  name: string;
  capital?: string;
  population?: string;
  continent?: string;
  flag?: string;
}

interface GeographyProperties {
  ISO_A3?: string;
  iso_a3?: string;
  ISO_A2?: string;
  iso_a2?: string;
  NAME?: string;
  name?: string;
  ADMIN?: string;
  admin?: string;
  [key: string]: unknown;
}

interface GeographyObject {
  properties: GeographyProperties;
  [key: string]: unknown;
}

export interface MapGameProps {
  gameType: 'explorer' | 'guesser' | 'connector';
  onCountryClick?: (countryId: string, countryName?: string) => void;
  selectedCountries?: string[];
  temperatureData?: { [key: string]: 'hot' | 'warm' | 'cold' | 'perfect' };
  mysteryCountry?: string;
  gameState?: 'playing' | 'won' | 'lost';
  onReset?: () => void;
  countries?: CountryData[];
}

// Comprehensive country data that matches the actual map data
export const WORLD_COUNTRIES: CountryData[] = [
  // North America
  { id: "USA", name: "United States of America", capital: "Washington D.C.", population: "331M", continent: "North America", flag: "🇺🇸" },
  { id: "CAN", name: "Canada", capital: "Ottawa", population: "38M", continent: "North America", flag: "🇨🇦" },
  { id: "MEX", name: "Mexico", capital: "Mexico City", population: "129M", continent: "North America", flag: "🇲🇽" },
  { id: "GTM", name: "Guatemala", capital: "Guatemala City", population: "18M", continent: "North America", flag: "🇬🇹" },
  { id: "BLZ", name: "Belize", capital: "Belmopan", population: "0.4M", continent: "North America", flag: "🇧🇿" },
  { id: "SLV", name: "El Salvador", capital: "San Salvador", population: "6M", continent: "North America", flag: "🇸🇻" },
  { id: "HND", name: "Honduras", capital: "Tegucigalpa", population: "10M", continent: "North America", flag: "🇭🇳" },
  { id: "NIC", name: "Nicaragua", capital: "Managua", population: "7M", continent: "North America", flag: "🇳🇮" },
  { id: "CRI", name: "Costa Rica", capital: "San José", population: "5M", continent: "North America", flag: "🇨🇷" },
  { id: "PAN", name: "Panama", capital: "Panama City", population: "4M", continent: "North America", flag: "🇵🇦" },
  { id: "CUB", name: "Cuba", capital: "Havana", population: "11M", continent: "North America", flag: "🇨🇺" },
  { id: "JAM", name: "Jamaica", capital: "Kingston", population: "3M", continent: "North America", flag: "🇯🇲" },
  { id: "HTI", name: "Haiti", capital: "Port-au-Prince", population: "11M", continent: "North America", flag: "🇭🇹" },
  { id: "DOM", name: "Dominican Republic", capital: "Santo Domingo", population: "11M", continent: "North America", flag: "🇩🇴" },
  { id: "PRI", name: "Puerto Rico", capital: "San Juan", population: "3M", continent: "North America", flag: "🇵🇷" },
  { id: "BRB", name: "Barbados", capital: "Bridgetown", population: "0.3M", continent: "North America", flag: "🇧🇧" },
  { id: "TTO", name: "Trinidad and Tobago", capital: "Port of Spain", population: "1M", continent: "North America", flag: "🇹🇹" },
  { id: "GRD", name: "Grenada", capital: "St. George's", population: "0.1M", continent: "North America", flag: "🇬🇩" },
  { id: "LCA", name: "Saint Lucia", capital: "Castries", population: "0.2M", continent: "North America", flag: "🇱🇨" },
  { id: "VCT", name: "Saint Vincent and the Grenadines", capital: "Kingstown", population: "0.1M", continent: "North America", flag: "🇻🇨" },
  { id: "ATG", name: "Antigua and Barbuda", capital: "Saint John's", population: "0.1M", continent: "North America", flag: "🇦🇬" },
  { id: "KNA", name: "Saint Kitts and Nevis", capital: "Basseterre", population: "0.05M", continent: "North America", flag: "🇰🇳" },
  { id: "DMA", name: "Dominica", capital: "Roseau", population: "0.07M", continent: "North America", flag: "🇩🇲" },
  { id: "BHS", name: "Bahamas", capital: "Nassau", population: "0.4M", continent: "North America", flag: "🇧🇸" },
  
  // South America
  { id: "BRA", name: "Brazil", capital: "Brasília", population: "214M", continent: "South America", flag: "🇧🇷" },
  { id: "ARG", name: "Argentina", capital: "Buenos Aires", population: "45M", continent: "South America", flag: "🇦🇷" },
  { id: "COL", name: "Colombia", capital: "Bogotá", population: "51M", continent: "South America", flag: "🇨🇴" },
  { id: "PER", name: "Peru", capital: "Lima", population: "33M", continent: "South America", flag: "🇵🇪" },
  { id: "CHL", name: "Chile", capital: "Santiago", population: "19M", continent: "South America", flag: "🇨🇱" },
  { id: "VEN", name: "Venezuela", capital: "Caracas", population: "28M", continent: "South America", flag: "🇻🇪" },
  { id: "ECU", name: "Ecuador", capital: "Quito", population: "18M", continent: "South America", flag: "🇪🇨" },
  { id: "BOL", name: "Bolivia", capital: "La Paz", population: "12M", continent: "South America", flag: "🇧🇴" },
  { id: "PRY", name: "Paraguay", capital: "Asunción", population: "7M", continent: "South America", flag: "🇵🇾" },
  { id: "URY", name: "Uruguay", capital: "Montevideo", population: "3M", continent: "South America", flag: "🇺🇾" },
  { id: "GUY", name: "Guyana", capital: "Georgetown", population: "0.8M", continent: "South America", flag: "🇬🇾" },
  { id: "SUR", name: "Suriname", capital: "Paramaribo", population: "0.6M", continent: "South America", flag: "🇸🇷" },
  { id: "GUF", name: "French Guiana", capital: "Cayenne", population: "0.3M", continent: "South America", flag: "🇬🇫" },
  
  // Europe
  { id: "RUS", name: "Russian Federation", capital: "Moscow", population: "144M", continent: "Europe", flag: "🇷🇺" },
  { id: "DEU", name: "Germany", capital: "Berlin", population: "83M", continent: "Europe", flag: "🇩🇪" },
  { id: "FRA", name: "France", capital: "Paris", population: "67M", continent: "Europe", flag: "🇫🇷" },
  { id: "ITA", name: "Italy", capital: "Rome", population: "60M", continent: "Europe", flag: "🇮🇹" },
  { id: "ESP", name: "Spain", capital: "Madrid", population: "47M", continent: "Europe", flag: "🇪🇸" },
  { id: "GBR", name: "United Kingdom", capital: "London", population: "67M", continent: "Europe", flag: "🇬🇧" },
  { id: "POL", name: "Poland", capital: "Warsaw", population: "38M", continent: "Europe", flag: "🇵🇱" },
  { id: "UKR", name: "Ukraine", capital: "Kyiv", population: "44M", continent: "Europe", flag: "🇺🇦" },
  { id: "ROU", name: "Romania", capital: "Bucharest", population: "19M", continent: "Europe", flag: "🇷🇴" },
  { id: "NLD", name: "Netherlands", capital: "Amsterdam", population: "17M", continent: "Europe", flag: "🇳🇱" },
  { id: "BEL", name: "Belgium", capital: "Brussels", population: "11M", continent: "Europe", flag: "🇧🇪" },
  { id: "CZE", name: "Czech Republic", capital: "Prague", population: "10M", continent: "Europe", flag: "🇨🇿" },
  { id: "GRC", name: "Greece", capital: "Athens", population: "11M", continent: "Europe", flag: "🇬🇷" },
  { id: "PRT", name: "Portugal", capital: "Lisbon", population: "10M", continent: "Europe", flag: "🇵🇹" },
  { id: "SWE", name: "Sweden", capital: "Stockholm", population: "10M", continent: "Europe", flag: "🇸🇪" },
  { id: "HUN", name: "Hungary", capital: "Budapest", population: "10M", continent: "Europe", flag: "🇭🇺" },
  { id: "AUT", name: "Austria", capital: "Vienna", population: "9M", continent: "Europe", flag: "🇦🇹" },
  { id: "BGR", name: "Bulgaria", capital: "Sofia", population: "7M", continent: "Europe", flag: "🇧🇬" },
  { id: "SRB", name: "Serbia", capital: "Belgrade", population: "7M", continent: "Europe", flag: "🇷🇸" },
  { id: "HRV", name: "Croatia", capital: "Zagreb", population: "4M", continent: "Europe", flag: "🇭🇷" },
  { id: "SVK", name: "Slovakia", capital: "Bratislava", population: "5M", continent: "Europe", flag: "🇸🇰" },
  { id: "DNK", name: "Denmark", capital: "Copenhagen", population: "6M", continent: "Europe", flag: "🇩🇰" },
  { id: "FIN", name: "Finland", capital: "Helsinki", population: "5M", continent: "Europe", flag: "🇫🇮" },
  { id: "NOR", name: "Norway", capital: "Oslo", population: "5M", continent: "Europe", flag: "🇳🇴" },
  { id: "IRL", name: "Ireland", capital: "Dublin", population: "5M", continent: "Europe", flag: "🇮🇪" },
  { id: "CHE", name: "Switzerland", capital: "Bern", population: "8M", continent: "Europe", flag: "🇨🇭" },
  { id: "LTU", name: "Lithuania", capital: "Vilnius", population: "3M", continent: "Europe", flag: "🇱🇹" },
  { id: "LVA", name: "Latvia", capital: "Riga", population: "2M", continent: "Europe", flag: "🇱🇻" },
  { id: "EST", name: "Estonia", capital: "Tallinn", population: "1M", continent: "Europe", flag: "🇪🇪" },
  { id: "BLR", name: "Belarus", capital: "Minsk", population: "9M", continent: "Europe", flag: "🇧🇾" },
  { id: "MDA", name: "Moldova", capital: "Chișinău", population: "3M", continent: "Europe", flag: "🇲🇩" },
  { id: "ALB", name: "Albania", capital: "Tirana", population: "3M", continent: "Europe", flag: "🇦🇱" },
  { id: "MKD", name: "North Macedonia", capital: "Skopje", population: "2M", continent: "Europe", flag: "🇲🇰" },
  { id: "BIH", name: "Bosnia and Herzegovina", capital: "Sarajevo", population: "3M", continent: "Europe", flag: "🇧🇦" },
  { id: "SVN", name: "Slovenia", capital: "Ljubljana", population: "2M", continent: "Europe", flag: "🇸🇮" },
  { id: "MNE", name: "Montenegro", capital: "Podgorica", population: "0.6M", continent: "Europe", flag: "🇲🇪" },
  { id: "KOS", name: "Kosovo", capital: "Pristina", population: "2M", continent: "Europe", flag: "🇽🇰" },
  { id: "ISL", name: "Iceland", capital: "Reykjavik", population: "0.4M", continent: "Europe", flag: "🇮🇸" },
  { id: "LUX", name: "Luxembourg", capital: "Luxembourg City", population: "0.6M", continent: "Europe", flag: "🇱🇺" },
  { id: "MLT", name: "Malta", capital: "Valletta", population: "0.5M", continent: "Europe", flag: "🇲🇹" },
  { id: "CYP", name: "Cyprus", capital: "Nicosia", population: "1M", continent: "Europe", flag: "🇨🇾" },
  { id: "LIE", name: "Liechtenstein", capital: "Vaduz", population: "0.04M", continent: "Europe", flag: "🇱🇮" },
  { id: "MCO", name: "Monaco", capital: "Monaco", population: "0.04M", continent: "Europe", flag: "🇲🇨" },
  { id: "AND", name: "Andorra", capital: "Andorra la Vella", population: "0.08M", continent: "Europe", flag: "🇦🇩" },
  { id: "SMR", name: "San Marino", capital: "San Marino", population: "0.03M", continent: "Europe", flag: "🇸🇲" },
  { id: "VAT", name: "Vatican City", capital: "Vatican City", population: "0.001M", continent: "Europe", flag: "🇻🇦" },
  
  // Asia
  { id: "CHN", name: "China", capital: "Beijing", population: "1.4B", continent: "Asia", flag: "🇨🇳" },
  { id: "IND", name: "India", capital: "New Delhi", population: "1.4B", continent: "Asia", flag: "🇮🇳" },
  { id: "JPN", name: "Japan", capital: "Tokyo", population: "126M", continent: "Asia", flag: "🇯🇵" },
  { id: "KOR", name: "South Korea", capital: "Seoul", population: "51M", continent: "Asia", flag: "🇰🇷" },
  { id: "PRK", name: "North Korea", capital: "Pyongyang", population: "26M", continent: "Asia", flag: "🇰🇵" },
  { id: "MNG", name: "Mongolia", capital: "Ulaanbaatar", population: "3M", continent: "Asia", flag: "🇲🇳" },
  { id: "TWN", name: "Taiwan", capital: "Taipei", population: "24M", continent: "Asia", flag: "🇹🇼" },
  { id: "HKG", name: "Hong Kong", capital: "Hong Kong", population: "7M", continent: "Asia", flag: "🇭🇰" },
  { id: "MAC", name: "Macau", capital: "Macau", population: "0.7M", continent: "Asia", flag: "🇲🇴" },
  { id: "THA", name: "Thailand", capital: "Bangkok", population: "70M", continent: "Asia", flag: "🇹🇭" },
  { id: "VNM", name: "Vietnam", capital: "Hanoi", population: "97M", continent: "Asia", flag: "🇻🇳" },
  { id: "LAO", name: "Laos", capital: "Vientiane", population: "7M", continent: "Asia", flag: "🇱🇦" },
  { id: "KHM", name: "Cambodia", capital: "Phnom Penh", population: "17M", continent: "Asia", flag: "🇰🇭" },
  { id: "MMR", name: "Myanmar", capital: "Naypyidaw", population: "54M", continent: "Asia", flag: "🇲🇲" },
  { id: "MYS", name: "Malaysia", capital: "Kuala Lumpur", population: "32M", continent: "Asia", flag: "🇲🇾" },
  { id: "SGP", name: "Singapore", capital: "Singapore", population: "5M", continent: "Asia", flag: "🇸🇬" },
  { id: "IDN", name: "Indonesia", capital: "Jakarta", population: "274M", continent: "Asia", flag: "🇮🇩" },
  { id: "PHL", name: "Philippines", capital: "Manila", population: "109M", continent: "Asia", flag: "🇵🇭" },
  { id: "BRN", name: "Brunei", capital: "Bandar Seri Begawan", population: "0.4M", continent: "Asia", flag: "🇧🇳" },
  { id: "TLS", name: "Timor-Leste", capital: "Dili", population: "1M", continent: "Asia", flag: "🇹🇱" },
  { id: "PAK", name: "Pakistan", capital: "Islamabad", population: "220M", continent: "Asia", flag: "🇵🇰" },
  { id: "AFG", name: "Afghanistan", capital: "Kabul", population: "39M", continent: "Asia", flag: "🇦🇫" },
  { id: "IRN", name: "Iran", capital: "Tehran", population: "84M", continent: "Asia", flag: "🇮🇷" },
  { id: "IRQ", name: "Iraq", capital: "Baghdad", population: "40M", continent: "Asia", flag: "🇮🇶" },
  { id: "SYR", name: "Syria", capital: "Damascus", population: "18M", continent: "Asia", flag: "🇸🇾" },
  { id: "LBN", name: "Lebanon", capital: "Beirut", population: "7M", continent: "Asia", flag: "🇱🇧" },
  { id: "JOR", name: "Jordan", capital: "Amman", population: "10M", continent: "Asia", flag: "🇯🇴" },
  { id: "ISR", name: "Israel", capital: "Jerusalem", population: "9M", continent: "Asia", flag: "🇮🇱" },
  { id: "PSE", name: "Palestine", capital: "East Jerusalem", population: "5M", continent: "Asia", flag: "🇵🇸" },
  { id: "SAU", name: "Saudi Arabia", capital: "Riyadh", population: "35M", continent: "Asia", flag: "🇸🇦" },
  { id: "YEM", name: "Yemen", capital: "Sana'a", population: "30M", continent: "Asia", flag: "🇾🇪" },
  { id: "OMN", name: "Oman", capital: "Muscat", population: "5M", continent: "Asia", flag: "🇴🇲" },
  { id: "ARE", name: "United Arab Emirates", capital: "Abu Dhabi", population: "10M", continent: "Asia", flag: "🇦🇪" },
  { id: "QAT", name: "Qatar", capital: "Doha", population: "3M", continent: "Asia", flag: "🇶🇦" },
  { id: "BHR", name: "Bahrain", capital: "Manama", population: "2M", continent: "Asia", flag: "🇧🇭" },
  { id: "KWT", name: "Kuwait", capital: "Kuwait City", population: "4M", continent: "Asia", flag: "🇰🇼" },
  { id: "TUR", name: "Turkey", capital: "Ankara", population: "84M", continent: "Asia", flag: "🇹🇷" },
  { id: "GEO", name: "Georgia", capital: "Tbilisi", population: "4M", continent: "Asia", flag: "🇬🇪" },
  { id: "ARM", name: "Armenia", capital: "Yerevan", population: "3M", continent: "Asia", flag: "🇦🇲" },
  { id: "AZE", name: "Azerbaijan", capital: "Baku", population: "10M", continent: "Asia", flag: "🇦🇿" },
  { id: "KAZ", name: "Kazakhstan", capital: "Nur-Sultan", population: "19M", continent: "Asia", flag: "🇰🇿" },
  { id: "UZB", name: "Uzbekistan", capital: "Tashkent", population: "34M", continent: "Asia", flag: "🇺🇿" },
  { id: "KGZ", name: "Kyrgyzstan", capital: "Bishkek", population: "6M", continent: "Asia", flag: "🇰🇬" },
  { id: "TJK", name: "Tajikistan", capital: "Dushanbe", population: "9M", continent: "Asia", flag: "🇹🇯" },
  { id: "TKM", name: "Turkmenistan", capital: "Ashgabat", population: "6M", continent: "Asia", flag: "🇹🇲" },
  { id: "BGD", name: "Bangladesh", capital: "Dhaka", population: "165M", continent: "Asia", flag: "🇧🇩" },
  { id: "LKA", name: "Sri Lanka", capital: "Colombo", population: "22M", continent: "Asia", flag: "🇱🇰" },
  { id: "NPL", name: "Nepal", capital: "Kathmandu", population: "29M", continent: "Asia", flag: "🇳🇵" },
  { id: "BTN", name: "Bhutan", capital: "Thimphu", population: "0.8M", continent: "Asia", flag: "🇧🇹" },
  { id: "MDV", name: "Maldives", capital: "Male", population: "0.5M", continent: "Asia", flag: "🇲🇻" },
  
  // Africa
  { id: "EGY", name: "Egypt", capital: "Cairo", population: "104M", continent: "Africa", flag: "🇪🇬" },
  { id: "LBY", name: "Libya", capital: "Tripoli", population: "7M", continent: "Africa", flag: "🇱🇾" },
  { id: "TUN", name: "Tunisia", capital: "Tunis", population: "12M", continent: "Africa", flag: "🇹🇳" },
  { id: "DZA", name: "Algeria", capital: "Algiers", population: "44M", continent: "Africa", flag: "🇩🇿" },
  { id: "MAR", name: "Morocco", capital: "Rabat", population: "37M", continent: "Africa", flag: "🇲🇦" },
  { id: "ESH", name: "Western Sahara", capital: "El Aaiún", population: "0.6M", continent: "Africa", flag: "🇪🇭" },
  { id: "SDN", name: "Sudan", capital: "Khartoum", population: "44M", continent: "Africa", flag: "🇸🇩" },
  { id: "SSD", name: "South Sudan", capital: "Juba", population: "11M", continent: "Africa", flag: "🇸🇸" },
  { id: "ETH", name: "Ethiopia", capital: "Addis Ababa", population: "115M", continent: "Africa", flag: "🇪🇹" },
  { id: "ERI", name: "Eritrea", capital: "Asmara", population: "4M", continent: "Africa", flag: "🇪🇷" },
  { id: "DJI", name: "Djibouti", capital: "Djibouti", population: "1M", continent: "Africa", flag: "🇩🇯" },
  { id: "SOM", name: "Somalia", capital: "Mogadishu", population: "16M", continent: "Africa", flag: "🇸🇴" },
  { id: "KEN", name: "Kenya", capital: "Nairobi", population: "54M", continent: "Africa", flag: "🇰🇪" },
  { id: "TZA", name: "Tanzania", capital: "Dodoma", population: "60M", continent: "Africa", flag: "🇹🇿" },
  { id: "UGA", name: "Uganda", capital: "Kampala", population: "46M", continent: "Africa", flag: "🇺🇬" },
  { id: "RWA", name: "Rwanda", capital: "Kigali", population: "13M", continent: "Africa", flag: "🇷🇼" },
  { id: "BDI", name: "Burundi", capital: "Gitega", population: "12M", continent: "Africa", flag: "🇧🇮" },
  { id: "COD", name: "Democratic Republic of the Congo", capital: "Kinshasa", population: "89M", continent: "Africa", flag: "🇨🇩" },
  { id: "COG", name: "Republic of the Congo", capital: "Brazzaville", population: "5M", continent: "Africa", flag: "🇨🇬" },
  { id: "GAB", name: "Gabon", capital: "Libreville", population: "2M", continent: "Africa", flag: "🇬🇦" },
  { id: "GNQ", name: "Equatorial Guinea", capital: "Malabo", population: "1M", continent: "Africa", flag: "🇬🇶" },
  { id: "STP", name: "São Tomé and Príncipe", capital: "São Tomé", population: "0.2M", continent: "Africa", flag: "🇸🇹" },
  { id: "CMR", name: "Cameroon", capital: "Yaoundé", population: "27M", continent: "Africa", flag: "🇨🇲" },
  { id: "CAF", name: "Central African Republic", capital: "Bangui", population: "5M", continent: "Africa", flag: "🇨🇫" },
  { id: "TCD", name: "Chad", capital: "N'Djamena", population: "16M", continent: "Africa", flag: "🇹🇩" },
  { id: "NER", name: "Niger", capital: "Niamey", population: "24M", continent: "Africa", flag: "🇳🇪" },
  { id: "NGA", name: "Nigeria", capital: "Abuja", population: "214M", continent: "Africa", flag: "🇳🇬" },
  { id: "BFA", name: "Burkina Faso", capital: "Ouagadougou", population: "21M", continent: "Africa", flag: "🇧🇫" },
  { id: "MLI", name: "Mali", capital: "Bamako", population: "20M", continent: "Africa", flag: "🇲🇱" },
  { id: "SEN", name: "Senegal", capital: "Dakar", population: "17M", continent: "Africa", flag: "🇸🇳" },
  { id: "GMB", name: "Gambia", capital: "Banjul", population: "2M", continent: "Africa", flag: "🇬🇲" },
  { id: "GNB", name: "Guinea-Bissau", capital: "Bissau", population: "2M", continent: "Africa", flag: "🇬🇼" },
  { id: "GIN", name: "Guinea", capital: "Conakry", population: "13M", continent: "Africa", flag: "🇬🇳" },
  { id: "SLE", name: "Sierra Leone", capital: "Freetown", population: "8M", continent: "Africa", flag: "🇸🇱" },
  { id: "LBR", name: "Liberia", capital: "Monrovia", population: "5M", continent: "Africa", flag: "🇱🇷" },
  { id: "CIV", name: "Ivory Coast", capital: "Yamoussoukro", population: "27M", continent: "Africa", flag: "🇨🇮" },
  { id: "GHA", name: "Ghana", capital: "Accra", population: "31M", continent: "Africa", flag: "🇬🇭" },
  { id: "TGO", name: "Togo", capital: "Lomé", population: "8M", continent: "Africa", flag: "🇹🇬" },
  { id: "BEN", name: "Benin", capital: "Porto-Novo", population: "12M", continent: "Africa", flag: "🇧🇯" },
  { id: "AGO", name: "Angola", capital: "Luanda", population: "33M", continent: "Africa", flag: "🇦🇴" },
  { id: "ZMB", name: "Zambia", capital: "Lusaka", population: "18M", continent: "Africa", flag: "🇿🇲" },
  { id: "ZWE", name: "Zimbabwe", capital: "Harare", population: "15M", continent: "Africa", flag: "🇿🇼" },
  { id: "BWA", name: "Botswana", capital: "Gaborone", population: "2M", continent: "Africa", flag: "🇧🇼" },
  { id: "NAM", name: "Namibia", capital: "Windhoek", population: "2M", continent: "Africa", flag: "🇳🇦" },
  { id: "ZAF", name: "South Africa", capital: "Pretoria", population: "60M", continent: "Africa", flag: "🇿🇦" },
  { id: "LSO", name: "Lesotho", capital: "Maseru", population: "2M", continent: "Africa", flag: "🇱🇸" },
  { id: "SWZ", name: "Eswatini", capital: "Mbabane", population: "1M", continent: "Africa", flag: "🇸🇿" },
  { id: "MDG", name: "Madagascar", capital: "Antananarivo", population: "28M", continent: "Africa", flag: "🇲🇬" },
  { id: "MUS", name: "Mauritius", capital: "Port Louis", population: "1M", continent: "Africa", flag: "🇲🇺" },
  { id: "SYC", name: "Seychelles", capital: "Victoria", population: "0.1M", continent: "Africa", flag: "🇸🇨" },
  { id: "COM", name: "Comoros", capital: "Moroni", population: "0.9M", continent: "Africa", flag: "🇰🇲" },
  
  // Oceania
  { id: "AUS", name: "Australia", capital: "Canberra", population: "26M", continent: "Oceania", flag: "🇦🇺" },
  { id: "NZL", name: "New Zealand", capital: "Wellington", population: "5M", continent: "Oceania", flag: "🇳🇿" },
  { id: "PNG", name: "Papua New Guinea", capital: "Port Moresby", population: "9M", continent: "Oceania", flag: "🇵🇬" },
  { id: "FJI", name: "Fiji", capital: "Suva", population: "0.9M", continent: "Oceania", flag: "🇫🇯" },
  { id: "SLB", name: "Solomon Islands", capital: "Honiara", population: "0.7M", continent: "Oceania", flag: "🇸🇧" },
  { id: "VUT", name: "Vanuatu", capital: "Port Vila", population: "0.3M", continent: "Oceania", flag: "🇻🇺" },
  { id: "NCL", name: "New Caledonia", capital: "Nouméa", population: "0.3M", continent: "Oceania", flag: "🇳🇨" },
  { id: "PYF", name: "French Polynesia", capital: "Papeete", population: "0.3M", continent: "Oceania", flag: "🇵🇫" },
  { id: "WSM", name: "Samoa", capital: "Apia", population: "0.2M", continent: "Oceania", flag: "🇼🇸" },
  { id: "TON", name: "Tonga", capital: "Nuku'alofa", population: "0.1M", continent: "Oceania", flag: "🇹🇴" },
  { id: "KIR", name: "Kiribati", capital: "South Tarawa", population: "0.1M", continent: "Oceania", flag: "🇰🇮" },
  { id: "TUV", name: "Tuvalu", capital: "Funafuti", population: "0.01M", continent: "Oceania", flag: "🇹🇻" },
  { id: "NRU", name: "Nauru", capital: "Yaren", population: "0.01M", continent: "Oceania", flag: "🇳🇷" },
  { id: "PLW", name: "Palau", capital: "Ngerulmud", population: "0.02M", continent: "Oceania", flag: "🇵🇼" },
  { id: "FSM", name: "Micronesia", capital: "Palikir", population: "0.1M", continent: "Oceania", flag: "🇫🇲" },
  { id: "MHL", name: "Marshall Islands", capital: "Majuro", population: "0.06M", continent: "Oceania", flag: "🇲🇭" }
];

export default function InteractiveWorldMap({
  gameType = 'explorer',
  onCountryClick,
  selectedCountries = [],
  temperatureData = {},
  mysteryCountry,
  gameState = 'playing',
  onReset,
  countries = []
}: MapGameProps) {
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const allCountries = countries.length > 0 ? countries : WORLD_COUNTRIES;

  // Prefer robust identification from the map itself, regardless of props supplied
  const getGeoIdentity = (geo: GeographyObject) => {
    const bestId =
      (geo.properties.ISO_A3 as string | undefined) ||
      (geo.properties.iso_a3 as string | undefined) ||
      (geo.properties.ISO_A2 as string | undefined) ||
      (geo.properties.iso_a2 as string | undefined) ||
      (geo.properties.NAME as string | undefined) ||
      (geo.properties.name as string | undefined) ||
      (geo.properties.ADMIN as string | undefined) ||
      (geo.properties.admin as string | undefined) ||
      "";
    const bestName =
      (geo.properties.NAME as string | undefined) ||
      (geo.properties.name as string | undefined) ||
      (geo.properties.ADMIN as string | undefined) ||
      (geo.properties.admin as string | undefined) ||
      bestId;
    return { bestId, bestName };
  };

  const getIso2 = (geo: GeographyObject): string | undefined => {
    const iso2 =
      (geo.properties.ISO_A2 as string | undefined) ||
      (geo.properties.iso_a2 as string | undefined);
    if (!iso2 || iso2 === "-99") return undefined;
    return iso2.toUpperCase();
  };

  const flagFromIso2 = (iso2?: string): string => {
    if (!iso2 || iso2.length !== 2) return "";
    const A = 0x1f1e6; // Regional Indicator Symbol Letter A
    const codePoints = iso2
      .toUpperCase()
      .split("")
      .map((char) => A + (char.charCodeAt(0) - 65));
    return String.fromCodePoint(...codePoints);
  };

  const getCountryColor = (geo: GeographyObject) => {
    const { bestId, bestName } = getGeoIdentity(geo);
    // Enrich with our known list using strict id first, then strict name
    let countryData = allCountries.find((c) => c.id === bestId);
    if (!countryData && bestName) {
      countryData = allCountries.find((c) => c.name === bestName);
    }

    const finalId = bestId || countryData?.id || "";
    if (!finalId) return "#374151";

    // Game-specific coloring using the final identifier
    switch (gameType) {
      case 'explorer':
        return selectedCountries.includes(finalId) ? "#10B981" : "#374151";
      
      case 'guesser':
        if (finalId === mysteryCountry) {
          return gameState === 'won' ? "#10B981" : "#374151";
        }
        if (temperatureData[finalId]) {
          const temp = temperatureData[finalId];
          switch (temp) {
            case 'perfect': return "#10B981";
            case 'hot': return "#EF4444";
            case 'warm': return "#F59E0B";
            case 'cold': return "#3B82F6";
            default: return "#374151";
          }
        }
        return selectedCountries.includes(finalId) ? "#6B7280" : "#374151";
      
      case 'connector':
        return selectedCountries.includes(finalId) ? "#8B5CF6" : "#374151";
      
      default:
        return "#374151";
    }
  };

  const handleCountryClick = (geo: GeographyObject) => {
    const { bestId, bestName } = getGeoIdentity(geo);
    console.log('Clicked country:', {
      bestId,
      bestName,
      allProperties: geo.properties,
      propertiesKeys: Object.keys(geo.properties)
    });

    // Only use strict matching to avoid Niger/Nigeria confusion
    let countryData = allCountries.find((c) => c.id === bestId);
    if (!countryData && bestName) {
      countryData = allCountries.find((c) => c.name === bestName);
    }

    const idToUse = bestId || countryData?.id || "";
    console.log('Resolved country id:', idToUse, 'country data:', countryData);

    if (onCountryClick && idToUse) {
      onCountryClick(idToUse, bestName);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    setTooltipPosition({ x: clientX, y: clientY });
  };

  const handleMouseEnter = (geo: GeographyObject) => {
    const { bestName } = getGeoIdentity(geo);
    let countryData = allCountries.find((c) => c.name === bestName);
    if (countryData) {
      setTooltipContent(`${countryData.flag ?? ''} ${countryData.name}`.trim());
      return;
    }
    const iso2 = getIso2(geo);
    const flag = flagFromIso2(iso2);
    if (bestName) {
      setTooltipContent(`${flag} ${bestName}`.trim());
    }
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  return (
    <div className="relative">
      {/* Game Info Panel */}
      <div className="mb-6">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Interactive World Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline" className="text-xs">
                {gameType === 'explorer' && 'Explorer Mode'}
                {gameType === 'guesser' && 'Guesser Mode'}
                {gameType === 'connector' && 'Connector Mode'}
              </Badge>
              {gameType === 'explorer' && (
                <span className="text-sm text-gray-300">
                  Visited: {selectedCountries.length} countries
                </span>
              )}
              {gameType === 'guesser' && (
                <span className="text-sm text-gray-300">
                  Guesses: {selectedCountries.length}/8
                </span>
              )}
              {onReset && (
                <Button variant="outline" size="sm" onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 147,
            center: [0, 0]
          }}
          style={{
            width: "100%",
            height: "500px"
          }}
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) => {
                // Debug: log first few geographies to understand structure
                if (geographies.length > 0) {
                  console.log('First geography object:', geographies[0]);
                  console.log('Available properties:', Object.keys(geographies[0].properties));
                }
                
                return geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(geo)}
                    stroke="#1F2937"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { 
                        fill: "#6B7280",
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: { outline: "none" }
                    }}
                    onClick={() => handleCountryClick(geo)}
                    onMouseEnter={() => handleMouseEnter(geo)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  />
                ))
              }}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: "translateY(-100%)"
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Game State Messages */}
      {gameType === 'guesser' && gameState !== 'playing' && (
        <div className="mt-6">
          <Card className={`${
            gameState === 'won' 
              ? 'bg-green-500/20 border-green-500/30' 
              : 'bg-red-500/20 border-red-500/30'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2">
                {gameState === 'won' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-semibold">You Got It!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 font-semibold">Game Over</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Temperature Legend for Guesser Game */}
      {gameType === 'guesser' && Object.keys(temperatureData).length > 0 && (
        <div className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Thermometer className="h-4 w-4" />
                Temperature Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Perfect</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Hot</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Warm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Cold</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}