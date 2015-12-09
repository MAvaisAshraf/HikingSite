﻿using GeoJSON.Net.Geometry;
using IsraelHiking.API.Controllers;
using IsraelHiking.Common;
using IsraelHiking.DataAccessInterfaces;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Results;

namespace IsraelHiking.API.Tests
{
    [TestClass]
    public class ConvertFilesControllerTests
    {
        private ConvertFilesController _controller;

        private IGpsBabelGateway _gpsBabelGateway;
        private IElevationDataStorage _elevationDataStorage;
        private IRemoteFileFetcherGateway _removeFileFetcherGateway;

        private const string GPX_DATA = @"<?xml version='1.0' encoding='UTF-8' standalone='no' ?>
            <gpx xmlns='http://www.topografix.com/GPX/1/1' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd' version='1.1' creator='togpx'>
            <wpt lat='31.85073184447357' lon='34.964332580566406'>
                <name></name>
                <desc>name=</desc>
            </wpt>
            <trk>
                <name>Route 1</name>
                <desc>name=Route 1</desc>
                <trkseg>
                    <trkpt lat='31.841402444946397' lon='34.96433406040586'><ele>167</ele></trkpt>
                    <trkpt lat='31.8414' lon='34.964336'><ele>167.5</ele></trkpt>
                    <trkpt lat='31.84205' lon='34.965344'><ele>161</ele></trkpt>
                    <trkpt lat='31.842161' lon='34.965611'><ele>161</ele></trkpt>
                    <trkpt lat='31.842175' lon='34.965707'><ele>161</ele></trkpt>
                </trkseg>
            </trk>
            </gpx>";


        [TestInitialize]
        public void TestInitialize()
        {
            ILogger logger = Substitute.For<ILogger>();
            _gpsBabelGateway = Substitute.For<IGpsBabelGateway>();
            _elevationDataStorage = Substitute.For<IElevationDataStorage>();
            _removeFileFetcherGateway = Substitute.For<IRemoteFileFetcherGateway>();
            _controller = new ConvertFilesController(logger, _gpsBabelGateway, _elevationDataStorage, _removeFileFetcherGateway);
        }

        [TestMethod]
        public void GetRemoteFile_ConvertKmlToGeoJson_ShouldReturnOnePointAndOneLineString()
        {
            var url = "someurl";
            byte[] bytes = Encoding.ASCII.GetBytes(GPX_DATA);
            _removeFileFetcherGateway.GetFileContent(url).Returns(Task.FromResult(new RemoteFileFetcherGatewayResponse { Content = bytes, FileName = "file.KML" }));
            _gpsBabelGateway.ConvertFileFromat(bytes, "kml", "gpx,gpxver=1.1").Returns(Task.FromResult(bytes));

            var featureCollection = _controller.GetRemoteFile(url).Result;

            Assert.AreEqual(2, featureCollection.Features.Count);
            Assert.IsTrue(featureCollection.Features[0].Geometry is Point);
            Assert.IsTrue(featureCollection.Features[1].Geometry is LineString);
        }

        [TestMethod]
        public void PostConvertFile_ConvertToKml_ShouldReturnByteArray()
        {
            var multipartContent = new MultipartContent();
            var streamContent = new StreamContent(new MemoryStream(new byte[1] { 1 }));
            streamContent.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data")
            {
                Name = "\"files\"",
                FileName = "\"SomeFile.twl\""
            };
            streamContent.Headers.ContentType = new MediaTypeHeaderValue("application/kml");
            multipartContent.Add(streamContent);
            _controller.Request = new HttpRequestMessage();
            _controller.Request.Content = multipartContent;
            _gpsBabelGateway.ConvertFileFromat(Arg.Any<byte[]>(), "naviguide", "kml").Returns(Task.FromResult(new byte[2] { 1, 1 }));

            var response = _controller.PostConvertFile("kml").Result as OkNegotiatedContentResult<byte[]>;

            Assert.AreEqual(2, response.Content.Length);
        }

        [TestMethod]
        public void PostConvertFile_NoFiles_ShouldReturnBadRequest()
        {
            var multipartContent = new MultipartContent();
            _controller.Request = new HttpRequestMessage();
            _controller.Request.Content = multipartContent;
            _gpsBabelGateway.ConvertFileFromat(Arg.Any<byte[]>(), "naviguide", "kml").Returns(Task.FromResult(new byte[2] { 1, 1 }));

            var response = _controller.PostConvertFile("kml").Result as BadRequestResult;

            Assert.IsNotNull(response);
        }
    }
}
