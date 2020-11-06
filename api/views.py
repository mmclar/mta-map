from datetime import datetime

import requests
from django.http import JsonResponse
from google.transit import gtfs_realtime_pb2

from api import models, gtfs

MTA_INFO_URL = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g'
MTA_API_KEY = 'lhVgkMCFZk343GkVtKJ0N3ES4fIhz8Rr1jPD4U8A'

def _get_time_from_response_content(content):
    try:
        feed = gtfs_realtime_pb2.FeedMessage()
        feed.ParseFromString(content)
        return datetime.fromtimestamp(feed.header.timestamp)
    except Exception as ex:
        return None

def hash_request(method, url, headers):
    return method + url + repr(headers)

def cached_get(method, url, headers={}):
    hash = hash_request(method, url, headers)
    try:
        content = models.ApiResponse.objects.get(hash=hash).content
    except models.ApiResponse.DoesNotExist:
        response = requests.request(method, url, headers=headers)
        models.ApiResponse(
            hash=hash,
            content=response.content,
        ).save()
        content = response.content
    return (content, _get_time_from_response_content(content))

def train_locations(request):
    api_response, rt_timestamp = cached_get('GET', MTA_INFO_URL, headers={
        'x-api-key': MTA_API_KEY,
    })
    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(api_response)
    response = {}
    for trip in feed.entity:
        if trip.HasField('trip_update'):
            print('=============================')
            print(f'trip {trip.trip_update.trip.trip_id}')
            for update in trip.trip_update.stop_time_update:
                stop_name = gtfs.stops_by_id[update.stop_id].name
                arrival_time = datetime.fromtimestamp(update.arrival.time)
                print(f'Trip with ID {trip.id} arrived at {stop_name} at {arrival_time}')

    return JsonResponse({})
