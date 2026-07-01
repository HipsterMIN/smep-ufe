<%@page import="com.dreamsecurity.jcaos.util.FileUtil"%>
<%@page import="com.dreamsecurity.xml.security.service.DSXmlService"%>
<%@page import="com.dreamsecurity.xml.security.service.DSXMLNonPluginService"%>
<%@ page import="com.dreamsecurity.magicline.json.*"%>
<%@ page import="java.net.URLDecoder"%>

<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<%
	String		szSignedInfoJsonValue	= "";
	String		szSignedInfoArrayValue	= "";
	String		inputXMLDocument		= request.getParameter("xmldoc");	
	JSONObject	XMLDocumentjson			= new JSONObject();
	JSONArray	XMLDocumentarray		= new JSONArray();
	JSONParser	jsonParser				= new JSONParser();
	Object		jsonObject				= null;
	JSONArray	jsonArrayObj			= null;
	
	if(inputXMLDocument != null && inputXMLDocument.length() > 0) {
		byte[][] binXML = null;
		
		inputXMLDocument = URLDecoder.decode(inputXMLDocument, "utf-8");

		try{
			jsonObject = jsonParser.parse(inputXMLDocument);
		}catch(Exception ex){
			out.println("<script>alert('입력한 XML 데이터를 다시 확인해 주세요(1).');history.back();</script>");
		}
		
		if (jsonObject != null && jsonObject instanceof JSONArray){
			jsonArrayObj = (JSONArray)jsonObject;			
			binXML = new byte[jsonArrayObj.size()][];						
			for (int i=0; i<jsonArrayObj.size(); i++){
				String xmldocument = jsonArrayObj.get(i).toString();				
				try {
					binXML[i] = xmldocument.getBytes();
				}catch(Exception e) {
					out.println("<script>alert('입력한 XML 데이터를 다시 확인해 주세요(2).');history.back();</script>");
				}
			}
		}
		
		/*
			XML Non-PlugIn Service 를 위해 SignedInfo 를 생성하여 <signData> Text Area 에 설정한다.
		*/
		try {
			String szSignedInfo	= "";
			String szDocID 		= "";
			
			Object[] xmlObjects = new Object[binXML.length];
			DSXMLNonPluginService xmlNonPlugin = null;
			
			for (int i=0; i<binXML.length; i++){
				xmlNonPlugin = new DSXMLNonPluginService(DSXmlService.NTS_XML_SERVICE);
				
				xmlNonPlugin.setXmlDoc(binXML[i]);
				
				szSignedInfo = xmlNonPlugin.getSignedInfo();
				szDocID = xmlNonPlugin.getDocumentID();
				
				XMLDocumentjson.put(szDocID, szSignedInfo);
				XMLDocumentarray.add(szSignedInfo);
				
				xmlObjects[i] = xmlNonPlugin;
			}
			
			szSignedInfoJsonValue 	= XMLDocumentjson.toJSONString();
			szSignedInfoArrayValue	= XMLDocumentarray.toJSONString();
			
			session.setAttribute("xmlNonPlugin", xmlObjects);
			
		} catch(Exception e) {
			e.printStackTrace();
			out.println("<script>alert('입력한 XML 데이터를 다시 확인해 주세요.');history.back();</script>");
			return;
		}
	} else {
		inputXMLDocument = "";
	}
%>

<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>
<script type="text/javascript" src="/MagicLine4Web/ML4Web/js/ext/xmlsign_api_nx.js"></script>
<script type="text/javascript">

//18.07.10
//1. 서명 원문 추가해서 signedFormR 에 서명 원문 데이터 파라미터 추가 
//2. 서명 원문 내용 출력 추가
$(document).ready(function() {		
});

var isResultShown = false;

function fn_log(message){
	if(!String.format){String.format=function(format){var args=Array.prototype.slice.call(arguments,1);return format.replace(/{(\d+)}/g,function(match,number){return typeof args[number]!='undefined'?args[number]:match})}}
	//var caller = arguments.callee.caller.name;
	//var logTime = String.format('<span style="font-weight: bold;"> [{0}] </span>', Date.now());	
	var d			= new Date();//Date.now();
	var curr_hour	= d.getHours();
	var curr_min	= d.getMinutes();
	var curr_sec	= d.getSeconds();
	var curr_msec	= d.getMilliseconds();
	
	var logText = String.format(' {0} ============================ {1}:{2}:{3}.{4}', message, curr_hour, curr_min, curr_sec, curr_msec);	
	//$("#logDiv").append(logTime);
	//$("#logDiv").append(logText);
	//$('#logDiv').scrollTop($('#logDiv').prop('scrollHeight'));	
	console.log(logText);
}

function doSignData(nType){	
	var	signData		= "";
	var signDataJson  	= $("#signDataJson").val();
	var signDataArray 	= $("#signDataArray").val();
	
	if(signDataJson.length < 1 || signDataArray.length < 1){
		alert('폼 데이터를 입력하세요.');
		return;
	}
	
	document.reqForm.signOrigin.value = encodeURIComponent(document.reqForm.signDataJson.value);
	// 차세대-개인테스트 인증서 

	try{
		if (nType == 1){
			signData = JSON.parse(signDataJson);	
		} else if (nType == 2){
			signData = JSON.parse(signDataArray);
		}				
	}catch(e){
		return;
	}
	
	//fn_log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! START");
	magicline.xsnxapi.Init(function(){
		magicline.xsnxapi.MakeXMLDSIG(signData, function(code, message){
			xmlResult = message;
			fn_log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! END");
			magicline.xsnxapi.GetRandom("", function(code, message){
				mlXMLCallBack(code, xmlResult);
			});
		});	
	})
}

// XML 서명 결과 데이터를 화면에 출력해주고 전송 버튼을 노출시켜주는 함수
function xmlSignResultDrawler(xmlSign){
	
	var htmlStream = "";
	
	if(typeof(message) === "undefiend"){
		alert('No message for signature. \nPlease make sure sign data');
		return;
	}
	
	htmlStream += '<tr>';
	htmlStream += '	<td> XML 서명 데이터 </td>';
	htmlStream += '	<td><textarea rows="5" cols="80" >' + xmlSign + '</textarea></td>';
	htmlStream += '</tr>';
	
	htmlStream += '<tr>';
	htmlStream += '	<td colspan="2" class="buttonRow" align="center">';	
	htmlStream += '		<input type="submit" class="button" value="전자서명 검증" name="Submit" formaction="./signedFormXML_multi_R.jsp">';	
	htmlStream += ' </td>';
	htmlStream += '</tr>';
	
	$("#signatureResultArea").html(htmlStream);
	//
	if(!isResultShown){			
		isResultShown=true;			
		$("#signatureResultDiv").css("display", "");
	}
}

function mlXMLCallBack(code, message) {
	if(code==0){
		// 서명한 인증서
		document.reqForm.cert.value = message.certbag.signcert;
		// 서명값
		document.reqForm.sign.value = encodeURIComponent(JSON.stringify(message.encMsg));
		xmlSignResultDrawler(JSON.stringify(message.encMsg));		
	} else {
		alert("결과값 수신에 실패하였습니다.");
		return;
	}
}

/*
 * Signed Info 생성
 */
function btnSignedinfo() {
	var xmldoc  = new Array();
	var xmldoc1 = document.getElementById('xml_doc1').value;
	var xmldoc2 = document.getElementById('xml_doc2').value;
	var xmldoc3 = document.getElementById('xml_doc3').value;
	
	if (xmldoc1.length <= 0 || xmldoc2.length <= 0 || xmldoc3.length <= 0) {
		alert('XML 문서를 입력 하십시오.');
		return;
	}
	
	for (var i=0; i<10; i++) {
	//	xmldoc.push(xmldoc1);
	}
	
	xmldoc.push(xmldoc1);
	xmldoc.push(xmldoc2);
	xmldoc.push(xmldoc3);
	
	//xml doc
	document.getElementById('xmldoc').value = encodeURIComponent(JSON.stringify(xmldoc));
	
	//createSigned
	document.getElementById('createSigned').submit();
	
}
</script>

<div id="middle">
	<h2>MagicLine XML Digital Signature</h2>
	<div id="workArea"><!-- DIV START  -->
	
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>&nbsp;&nbsp;XML 전자서명을 위해 '<'ds:SignedInfo'>' Tag 를 추출한다. </td>
		</tr>
	</table>
	
	<p>&nbsp;</p>
	<form id='createSigned' name='createSigned' method='post' action="./signedFormXML_multi.jsp">
		<input type="hidden" id="xmldoc" name="xmldoc" />
	</form>
	
	<form id='reqForm' name='reqForm' method='post' action="./signedFormXML_multi_R.jsp">
	<!-- 결과 수신 메시지  -->
	<input type="hidden" id="signOrigin" name="signOrigin" />
	<input type="hidden" id='sign' name='sign'/>
	<input type="hidden" id='cert' name='cert'/> <!-- 인증서는 미리 있는 걸로 간주한다. -->
	<input type="hidden" id='csCheckType' name='csCheckType' value="1"/>
	
	<!-- 전자서명 데이터 입력 영역 -->
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
			<tr>
				<th colspan="2">Client Digital Signature Information</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="formRow">
					<table class="normal" cellspacing="0" style="text-align: left;">
						<tr>
							<td>XML문서</td>
							<td>전자서명 XML Signed Info<font class="required">*</font></td>
						</tr>
						<tr>
							<td>
								<textarea id="xml_doc1" name="xml_doc1" rows="5" cols="70"><TaxInvoice xsi:schemaLocation="urn:kr:or:kec:standard:Tax:ReusableAggregateBusinessInformationEntitySchemaModule:1:0 http://www.kec.or.kr/standard/Tax/TaxInvoiceSchemaModule_1.0.xsd" xmlns="urn:kr:or:kec:standard:Tax:ReusableAggregateBusinessInformationEntitySchemaModule:1:0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ExchangedDocument>
	<Test>1</Test>
  </ExchangedDocument>
  <TestDocument>1</TestDocument>
</TaxInvoice>
								</textarea><br>
								<textarea id="xml_doc2" name="xml_doc2" rows="5" cols="70"><TaxInvoice xsi:schemaLocation="urn:kr:or:kec:standard:Tax:ReusableAggregateBusinessInformationEntitySchemaModule:1:0 http://www.kec.or.kr/standard/Tax/TaxInvoiceSchemaModule_1.0.xsd" xmlns="urn:kr:or:kec:standard:Tax:ReusableAggregateBusinessInformationEntitySchemaModule:1:0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ExchangedDocument>
	<Test>2</Test>
  </ExchangedDocument>
  <TestDocument>2</TestDocument>
</TaxInvoice>
								</textarea><br>
								<textarea id="xml_doc3" name="xml_doc3" rows="5" cols="70"><TaxInvoice xsi:schemaLocation="urn:kr:or:kec:standard:Tax:ReusableAggregateBusinessInformationEntitySchemaModule:1:0 http://www.kec.or.kr/standard/Tax/TaxInvoiceSchemaModule_1.0.xsd" xmlns="urn:kr:or:kec:standard:Tax:ReusableAggregateBusinessInformationEntitySchemaModule:1:0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ExchangedDocument>
	<Test>3</Test>
  </ExchangedDocument>
  <TestDocument>3</TestDocument>
</TaxInvoice>
								</textarea>
							</td>
							<td>
								JSON<br>
								<textarea id="signDataJson" name="signDataJson" rows="7" cols="70" readonly="readonly"><%=szSignedInfoJsonValue%></textarea><br>
								Array<br>
								<textarea id="signDataArray" name="signDataArray" rows="7" cols="70" readonly="readonly"><%=szSignedInfoArrayValue%></textarea>
							</td>
						</tr>
						<tr>
							<td colspan="2" >
								<input type="button" value="Signed Info 생성" onclick="btnSignedinfo();"/>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td colspan="2" class="buttonRow" align="center">
					<input id="aaa" type="button" class="button" value="전자서명(JSON Type)" onclick="doSignData(1);">
					<input id="aaa" type="button" class="button" value="전자서명(Array Type)" onclick="doSignData(2);">
				</td>
			</tr>
		</tbody>
	</table>
	<br>
	<!-- 전자서명 데이터 출력 영역 -->
	<div id="signatureResultDiv" style="display:none;" >
	<table style="width: 100%; height:100%"  class="styledLeft" >
		<thead>
			<tr>
				<th colspan="2">Signature Data Information</th>
			</tr>
		</thead>
		<tbody id="signatureResultArea">
		</tbody>	
	</table>
		
	</div>
	</form>
	<p>&nbsp;</p>
	
	</div>
</div><!-- DIV END  -->
<div id="selectCertContainer1" style="width:100%;margin-top:0; display:none;"></div>
<div id="startCs" style="width:100%;margin-top:0; display:none;"></div>
<jsp:include page="include/footer.jsp"></jsp:include>