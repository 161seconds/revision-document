from crewai.tools import tool
from typing import Optional

# --- New Hotel Search Function ---
@tool("Kayak Hotel Tool")
def kayak_hotel_search(
    location_query: str, check_in_date: str, check_out_date: str, num_adults: int = 2
) -> str:
    """
    Generates a Kayak URL for hotel searches based on location, dates, and number of adults.

    :param location_query: The location string used by Kayak (e.g., 'Hisar,Haryana,India-p15321')
    :param check_in_date: The check-in date in 'YYYY-MM-DD' format
    :param check_out_date: The check-out date in 'YYYY-MM-DD' format
    :param num_adults: The number of adults (defaults to 2)
    :return: The Kayak URL for the hotel search
    """
    print(f"Generating Kayak Hotel URL for {location_query} from {check_in_date} to {check_out_date} for {num_adults} adults")
    URL = f"https://www.kayak.co.in/hotels/{location_query}/{check_in_date}/{check_out_date}/{num_adults}adults"
    return URL

# Export the new decorated function
kayak_hotels = kayak_hotel_search