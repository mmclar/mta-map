import csv
import re
from collections import defaultdict
from dataclasses import dataclass
import datetime

from api.utils import pct

STOPS_FILE = 'api/data/gtfs/stops.txt'
TRIPS_FILE = 'api/data/gtfs/trips.txt'
STOP_TIMES_FILE = 'api/data/gtfs/g_stop_times.txt'

@dataclass
class Stop:
    id: str
    name: str
    lon: float
    lat: float

@dataclass
class Trip:
    trip_id: str

@dataclass
class StopTime:
    stop: Stop
    time: datetime.time

try:
    stops_by_id = {}
    with open(STOPS_FILE) as csvfile:
        reader = csv.reader(csvfile)
        next(reader)
        for id, code, name, desc, lat, lon, zone_id, url, location_type, parent_station in reader:
            stops_by_id[id] = Stop(id, name, float(lon), float(lat))


    trips_by_id = {}
    with open(TRIPS_FILE) as csvfile:
        reader = csv.reader(csvfile)
        next(reader)
        for route_id, service_id, trip_id, trip_headsign, direction_id, block_id, shape_id in reader:
            trips_by_id[id] = Stop(id, name, lon, lat)

    stop_times_by_rt_trip_id = defaultdict(list)
    with open(STOP_TIMES_FILE) as csvfile:
        reader = csv.reader(csvfile)
        for trip_id, arrival_time, departure_time, stop_id, stop_sequence, stop_headsign, pickup_type, drop_off_type, shape_dist_traveled in reader:
            rt_trip_id_match = re.search(r'(Weekday|Sunday|Saturday)-.._(.*\.\.[NS])', trip_id)
            time_match = re.search(r'(\d\d):(\d\d):(\d\d)', arrival_time)
            if time_match and rt_trip_id_match:
                dow, rt_trip_id = rt_trip_id_match.groups()
                hour, minute, second = map(int, time_match.groups())
                hour %= 24
                time = datetime.time(hour=hour, minute=minute, second=second)
                stop_times_by_rt_trip_id[dow, rt_trip_id].append((StopTime(stops_by_id[stop_id], time)))
except Exception as ex:
    print(ex)


def get_train_locations(when: datetime.datetime):
    trains = []
    for (dow, rt_trip_id), stop_times in stop_times_by_rt_trip_id.items():
        if dow != 'Sunday': # or rt_trip_id != '129350_G..S':
            continue
        prev = next = None
        do_continue = False
        for stop_time in stop_times:
            if stop_time.time < when.time():
                prev = stop_time or prev
            else:
                next = stop_time or next
            if prev and next:
                trains.append({
                    'rt_trip_id': rt_trip_id,
                    'prev_stop': prev.stop,
                    'next_stop': next.stop,
                    'pct': pct(prev.time, next.time, when.time())
                })
                do_continue = True
                break
        if do_continue:
            continue
    return trains






