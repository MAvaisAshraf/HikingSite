﻿using System.IO;
using System.Reflection;
using GeoAPI.Geometries;
using IsraelHiking.Common;
using IsraelHiking.DataAccessInterfaces;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace IsraelHiking.DataAccess.Tests
{
    [TestClass]
    public class ElevationDataStorageTests
    {
        private ConfigurationData _options;
        private IElevationDataStorage _elevationDataStorage;

        [TestInitialize]
        public void TestInitialize()
        {
            _options = new ConfigurationData();
            var optionsProvider = Substitute.For<IOptions<ConfigurationData>>();
            optionsProvider.Value.Returns(_options);
            _elevationDataStorage = new ElevationDataStorage(new TraceLogger(), optionsProvider, new FileSystemHelper());
        }

        [TestMethod]
        public void InitializeWithBadFolder_ShouldSucceed()
        {
            _options.BinariesFolder = "InvalidFolder";

            _elevationDataStorage.Initialize().Wait();

            Assert.AreEqual(0, _elevationDataStorage.GetElevation(new Coordinate(35, 32)).Result);
        }

        [TestMethod]
        public void InitializeAndGet_ShouldSucceed()
        {
            _options.BinariesFolder = Path.GetDirectoryName(Assembly.GetAssembly(typeof(ElevationDataStorageTests)).Location) ?? string.Empty;

            _elevationDataStorage.Initialize().Wait();

            Assert.AreEqual(0, _elevationDataStorage.GetElevation(new Coordinate(0,0)).Result);
            Assert.AreEqual(207, _elevationDataStorage.GetElevation(new Coordinate(35, 32)).Result);
            Assert.AreEqual(554.15067, _elevationDataStorage.GetElevation(new Coordinate(35.3896182, 32.687110)).Result, 1e-7);
        }
    }
}
