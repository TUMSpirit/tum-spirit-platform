from typing import Any
from bson import ObjectId
from fastapi import HTTPException
from pymongo.errors import ConnectionFailure
from ...utils.db import get_db

metadata_collection = get_db("chat_metadata")

def convert_objectid(item: Any) -> Any:
    if isinstance(item, dict):
        return {k: convert_objectid(v) for k, v in item.items()}
    elif isinstance(item, list):
        return [convert_objectid(i) for i in item]
    elif isinstance(item, ObjectId):
        return str(item)
    else:
        return item

def get_big5(userId, startDate=None, endDate=None):
    #TODO: conversion to list might break with large dataset, everything needs to be pulled into ram..

    filter_by = {"sender_id": userId}

    # filter start & end Date
    if startDate and endDate:
        filter_by["timestamp"] = {"$gt": startDate, "$lt": endDate}
    

    result = metadata_collection.find(
        filter_by, 
        {"_id": 0, "metadata": {"OCEAN": 1}, "timestamp": 1})
    result = [result]
    predictions = { 
        key: value["predicton_s"]
        for key, value in result.items()
    }
    result_list = [predictions]
    return result_list


def get_big5_team(userId, startDate=None, endDate=None):
    #TODO: conversion to list might break with large dataset, everything needs to be pulled into ram..

    filter_by = {"sender_id": userId}

    # filter start & end Date
    if startDate and endDate:
        filter_by["timestamp"] = {"$gt": startDate, "$lt": endDate}
    

    result = metadata_collection.find(
        filter_by, 
        {"_id": 0, "metadata": {"OCEAN": 1}, "timestamp": 1})
    
    result_list = [{"date": entry["timestamp"], "sentiment": entry["metadata"]["sentiment"]} for entry in result]

    return result_list



def get_sentiment(userId, startDate=None, endDate=None):
    #TODO: conversion to list might break with large dataset, everything needs to be pulled into ram..

    filter_by = {"sender_id": userId}

    # filter start & end Date
    if startDate and endDate:
        filter_by["timestamp"] = {"$gt": startDate, "$lt": endDate}
    

    result = metadata_collection.find(
        filter_by, 
        {"_id": 0, "metadata": {"sentiment": 1}, "timestamp": 1})
    result_list = [{"date": entry["timestamp"], "sentiment": entry["metadata"]["sentiment"]} for entry in result]

    return result_list

def get_sentiment2(start_date=None, end_date=None):
    try:
        # Query zur Suche der Einträge in der Collection
        query = {
            "timestamp": {
                "$gte": start_date,
                "$lte": end_date
            }
        }
        # Suche in der Collection
        items = list(metadata_collection.find(query))
        if not items:
            raise HTTPException(status_code=404, detail="Items not found")
        items = convert_objectid(items)
        return items
    except ConnectionFailure:
        # Fehlerbehandlung bei Verbindungsproblemen
        raise HTTPException(status_code=500, detail="Failed to connect to MongoDB")
    except Exception as e:
        # Generische Fehlerbehandlung für unerwartete Fehler
        raise HTTPException(status_code=500, detail=str(e))

