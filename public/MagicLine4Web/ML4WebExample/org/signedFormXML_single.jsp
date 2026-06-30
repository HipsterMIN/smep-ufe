<%@page import="com.dreamsecurity.jcaos.util.FileUtil"%>
<%@page import="com.dreamsecurity.xml.security.service.DSXmlService"%>
<%@page import="com.dreamsecurity.xml.security.service.DSXMLNonPluginService"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="com.dreamsecurity.magicline.json.*"%>

<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<%
	String szSignedInfoValue = "";
	String inputXMLDocument  = request.getParameter("xmldoc");	
	String szSignedInfo	= "";
	String szDocumentID = "";
	
	if(inputXMLDocument != null && inputXMLDocument.length() > 0) {
		byte[] binXML = null;		
		inputXMLDocument = URLDecoder.decode(inputXMLDocument, "utf-8");		
		binXML = inputXMLDocument.getBytes();
		
		/*
			XML Non-PlugIn Service 를 위해 SignedInfo 를 생성하여 <signData> Text Area 에 설정한다.
		*/
		try {		
			DSXMLNonPluginService xmlNonPlugin = null;
			
			xmlNonPlugin = new DSXMLNonPluginService(DSXmlService.NTS_XML_SERVICE);
			
			xmlNonPlugin.setXmlDoc(binXML);
			
			szSignedInfo = xmlNonPlugin.getSignedInfo();			
			szDocumentID = xmlNonPlugin.getDocumentID();
			
			session.setAttribute("xmlNonPlugin", xmlNonPlugin);			
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

function doSignData(){
	
	var signData  = $("#signData").val();
	var xmlResult = {};
	
	if(signData.length < 1){
		alert('폼 데이터를 입력하세요.');
		$("#signData").focus();
		return;
	}
	
	document.reqForm.signOrigin.value = encodeURIComponent(document.reqForm.signData.value);
	
	try{
		signData = JSON.parse(signData);		
	}catch(e){		
	}
	
	magicline.xsnxapi.Init(function(){
		magicline.xsnxapi.MakeXMLDSIG(signData, function(code, message){
			xmlResult = message;
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
	htmlStream += '		<input type="button" class="button" value="전송" name="Submit" onClick="this.form.submit();">';
	htmlStream += ' </td>';
	htmlStream += '</tr>';
	
	$("#signatureResultArea").html(htmlStream);
	
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
		document.reqForm.sign.value = encodeURIComponent(message.encMsg);
		xmlSignResultDrawler(message.encMsg);		
	} else {
		alert("결과값 수신에 실패하였습니다.");
		return;
	}
}

/*
 * Signed Info 생성
 */
function btnSignedinfo() {	
	var xmldoc = document.getElementById('xml_doc').value;
	
	//xml doc
	document.getElementById('xmldoc').value = encodeURIComponent(xmldoc);
	
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
	<form id='createSigned' name='createSigned' method='post' action="./signedFormXML_single.jsp">
		<input type="hidden" id="xmldoc" name="xmldoc" />
	</form>
	
	<form id='reqForm' name='reqForm' method='post' action="./signedFormXML_single_R.jsp">
	<!-- 결과 수신 메시지  -->
	<input type="hidden" id="signOrigin" name="signOrigin" /> <!-- 180701 서명 원문 폼 추가 -->
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
								<textarea id="xml_doc" name="xml_doc" rows="10" cols="70"><TaxInvoice xsi:schemaLocation="urn:kr:or:kec:standard:Tax:ReusableAggregateBusinessInformationEntitySchemaModule:1:0 http://www.kec.or.kr/standard/Tax/TaxInvoiceSchemaModule_1.0.xsd" xmlns="urn:kr:or:kec:standard:Tax:ReusableAggregateBusinessInformationEntitySchemaModule:1:0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ExchangedDocument>
	<Test>1</Test>
  </ExchangedDocument>
  <TestDocument>1</TestDocument>
</TaxInvoice>
								</textarea>
							</td>
							<td>
								<textarea id="signData" name="signData" rows="10" cols="70" readonly="readonly"><%=szSignedInfo%></textarea>
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
					<input id="aaa" type="button" class="button" value="전자서명" onclick="doSignData();">
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