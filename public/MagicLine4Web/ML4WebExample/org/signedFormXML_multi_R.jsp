<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Base64"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509Certificate"%>
<%@ page import="com.dreamsecurity.xml.security.service.DSXmlService"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="com.dreamsecurity.jcaos.util.FileUtil"%>
<%@ page import="com.dreamsecurity.xml.security.service.DSXMLNonPluginService"%>
<%@ page import="com.dreamsecurity.magicline.json.*"%>
<%@ page import="java.util.Map"%>
<%@ page import="java.util.Iterator"%>
<%
	// 서명 검증 셈플
	// 클라이언트에서 받은 서명 데이타를 검증
	String sResult = "";
	String sSignData = null;
	String sCertData = null;
	String szSignXML = "";
	String resultXML	= "";
	String resultSignData = "";
	boolean bVerify = false;
	
	try {				
		DSXMLNonPluginService	xmlNonPlugin = null;
		DSXmlService            xmlService = null;
		Object[]				xmlObjects  = (Object[])session.getAttribute("xmlNonPlugin");		
		Object					jsonObject  = null;
		String[]                docIDs = null;
		// 18.07.10 : 결과 확인을 위해 서명 원문 데이터를 가져온다
		//signOrigin = request.getParameter("signOrigin");
		//signOrigin = URLDecoder.decode(signOrigin, "utf-8");
		
		/**
		* 서명 대상 데이터 가져오기 
		*/
		sSignData = request.getParameter("sign");
		sSignData = URLDecoder.decode(sSignData, "utf-8");
		
		/**
		* 인증서 가져오기 
		*/
		sCertData = request.getParameter("cert");
		
		jsonObject = (new JSONParser()).parse(sSignData);
		
		if (jsonObject != null && jsonObject instanceof JSONObject){
			int			idx = 0;
			JSONObject	obj = (JSONObject)jsonObject;
			
			if (obj.size() != xmlObjects.length){
				throw new Exception("XML Object Length is mismatch !!");
			} else {
				docIDs = new String[obj.size()];
				
				/**************************************************
				*  Step 1 -> Get Document IDs
				***************************************************/
				for(Object key : obj.keySet()) {
					docIDs[idx] = (String)key;
					idx++;
				}
				
				/**************************************************
				*  Step 2 -> Compare Document ID & Signature verify
				***************************************************/
				for(int i=0; i<docIDs.length; i++) {
					for(int j=0; j<xmlObjects.length; j++) {
						
						xmlNonPlugin = (DSXMLNonPluginService)xmlObjects[j];
						if(docIDs[i].equals(xmlNonPlugin.getDocumentID())) {
							
							/*
							* Set Singnature Value
							*/
							sSignData = (String)obj.get(docIDs[i]);
							xmlNonPlugin.setSignatureInfo(sSignData, sCertData);
							szSignXML = xmlNonPlugin.getXMLSignDoc();
							
							/*
							* Process Singnature Verifiy
							*/
							xmlService = DSXmlService.getInstance(DSXmlService.NTS_XML_SERVICE);
							xmlService.setXmlDoc(szSignXML);
							xmlService.verify();
							
							/*
							* Set Result to HTML
							*/
							resultSignData += "\n\n-----[ DocumentID : " + docIDs[i] + " ]--------------------------------------------\n\n";					
							resultSignData += sSignData;

							resultXML += "\n\n-----[ DocumentID : " + docIDs[i] + " ]--------------------------------------------\n\n";					
							resultXML += szSignXML;
							
							break;
						}
					}
					
				}
				bVerify = true;
			}
		}else if (jsonObject != null && jsonObject instanceof JSONArray){
			int			idx = 0;
			JSONArray	obj = (JSONArray)jsonObject;
			
			if (obj.size() == 0){
				throw new Exception("XML Object size 0 !!");
			}
			
			for (int i=0; i<obj.size(); i++){
				xmlNonPlugin = (DSXMLNonPluginService)xmlObjects[i];
				
				/*
				* Set Singnature Value
				*/
				sSignData	 = obj.get(i).toString();
				xmlNonPlugin.setSignatureInfo(sSignData, sCertData);
				szSignXML = xmlNonPlugin.getXMLSignDoc();
				
				/*
				* Process Singnature Verifiy
				*/
				xmlService = DSXmlService.getInstance(DSXmlService.NTS_XML_SERVICE);
				xmlService.setXmlDoc(szSignXML);
				xmlService.verify();
				
				/*
				* Set Result to HTML
				*/
				resultSignData += "\n\n-----[ idx : " + Integer.toString(i) + " ]--------------------------------------------\n\n";					
				resultSignData += sSignData;

				resultXML += "\n\n-----[ idx : " + Integer.toString(i) + " ]--------------------------------------------\n\n";					
				resultXML += szSignXML;								
			}
			
			bVerify = true;
		}
		
		/**
		* X509 Certificate 정보 
		*/
		X509Certificate x509Cert = X509Certificate.getInstance(Base64.decode(sCertData));
		
		sResult =  "<br>\n- 사용자 DN ["+x509Cert.getSubjectDN().getName()+"]<br>\n"+"<br>\n";
		sResult += "- 발급자 DN ["+x509Cert.getIssuerDN().getName()+"]<br>\n"+"<br>\n";
		sResult += "- 인증서 SN ["+x509Cert.getSerialNumber().toString(16)+"]<br>\n"+"<br>\n";
		sResult += "- 인증서 정책 ["+x509Cert.getCertificatePolicies().getPolicyIdentifier(0)+"]<br>\n"+"<br>\n";
		
	} catch(Exception e) {
		e.printStackTrace();
		sResult = "서명 생성 혹은 검증에 실패 하였습니다.\n [" + e.getMessage()+"]\");";
	}
	
%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>

<div id="middle">
	<h2>MagicLine XML Digital Signature Result</h2>
	<div id="workArea"><!-- DIV START  -->
		<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>사용자가 선택한 인증서를 이용하여 XML 문서의 전자서명값을 추출하여 서버에서 전자서명 검증을 실행한다.</td>
		</tr>
		</table>
		
		<p>&nbsp;</p>
		<form action="login_renewR.jsp" method="post" name="popForm">
		<input type="hidden" id="verifyResult" name="verifyResult" value=<%=bVerify%>></input>
		<table style="width: 100%" class="styledLeft">
			<thead>
				<tr>
					<th colspan="2">XML Security Digital Signature Request Data</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="formRow">
					<table class="normal" cellspacing="0">
						<tr>
							<td>서명값</td>
							<td><textarea id="signOrigin" name="signOrigin" rows="10" cols="100"><%=resultSignData%></textarea></td>
						</tr>
						<tr>
							<td>서명결과</td>
							<td><textarea id="signResulttxt" name="signResulttxt" rows="15" cols="100"><%=resultXML%></textarea></td>
						</tr>
						<tr>
							<td>검증결과</td>
							<td id="resultArea"></td>
						</tr>
					</table>
					</td>
				</tr>
			</tbody>
		</table>
		<p>&nbsp;</p>
		<table style="width: 100%" class="styledLeft">
			<thead>
				<tr>
					<th colspan="2">Certificate Information</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="formRow">
					<table class="normal" cellspacing="0">
						<tr>
							<td><%=sResult%></td>
						</tr>						
					</table>
					</td>
				</tr>
			</tbody>
		</table>
		</form>
		<p>&nbsp;</p>
	</div>
</div>
<script type="text/javascript">
$(window).load(function(){
	
	var resultDOM = document.getElementById("resultArea");
	var result = document.popForm.verifyResult.value;
	
	if(result == 'true'){
		resultDOM.innerHTML = "<b><font color='green'>Verify OK</font></b>";
	}else{
		resultDOM.innerHTML = "<b><font color='red'>Verify Fail</font></b>";
	}
	
});
</script>
<jsp:include page="include/footer.jsp"></jsp:include>