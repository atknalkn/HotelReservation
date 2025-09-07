#!/bin/bash

# .NET 8 runtime'ı kullan
export DOTNET_ROOT=/usr/share/dotnet
export PATH=$PATH:$DOTNET_ROOT

# Projeyi çalıştır
dotnet HotelApi.dll
