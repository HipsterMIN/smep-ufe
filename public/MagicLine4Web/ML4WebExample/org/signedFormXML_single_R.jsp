<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Base64"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509Certificate"%>
<%@ page import="com.dreamsecurity.xml.security.service.DSXmlService"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="com.dreamsecurity.jcaos.util.FileUtil"%>
<%@ page import="com.dreamsecurity.xml.security.service.DSXMLNonPluginService"%>
<%
	// 서명 검증 셈플
	// 클라이언트에서 받은 서명 데이타를 검증
	String sResult = "";
	String sSignData = null;
	String sCertData = null;
	String szSignXML = "";
	String signOrigin = "";
	boolean bVerify = false;
	
	try {
		
		DSXMLNonPluginService xmlNonPlugin = (DSXMLNonPluginService)session.getAttribute("xmlNonPlugin");
		if(xmlNonPlugin == null) {
			System.out.println("xmlNonPlugin is NULL !!");
			xmlNonPlugin = new DSXMLNonPluginService(DSXmlService.NTS_XML_SERVICE);
			byte[] binXML = null;
			
			try {
				binXML = FileUtil.read("/Volumes/WORK/taxInvoice_bubin.xml");
			} catch(Exception e) {
				out.println("파일 경로를 다시 확인해 주세요.");
				throw new Exception(e);
			}
			xmlNonPlugin.setXmlDoc(binXML);
		}
		
		// 18.07.10 : 결과 확인을 위해 서명 원문 데이터를 가져온다
		signOrigin = request.getParameter("signOrigin");
		signOrigin = URLDecoder.decode(signOrigin, "utf-8");
		
		/**
		* 서명 대상 데이터 가져오기 
		*/
		sSignData = request.getParameter("sign");
		sSignData = URLDecoder.decode(sSignData, "utf-8");
		
		/**
		* 인증서 가져오기 
		*/
		sCertData = request.getParameter("cert");
		// 인증서는 URL Encode 를 하지 않았기에 decode 를 하지 않는다.
		//sCertData = URLDecoder.decode(sCertData, "utf-8");
		
		/**
		* 서명 수행 
		*/
		xmlNonPlugin.setSignatureInfo(sSignData, sCertData);
		szSignXML = xmlNonPlugin.getXMLSignDoc();
		
		/**
		 * 서명 검증 
		 */
		DSXmlService xmlService = DSXmlService.getInstance(DSXmlService.NTS_XML_SERVICE);
		xmlService.setXmlDoc(szSignXML);
		xmlService.verify();
		bVerify = true;
		
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
							<td><textarea id="signOrigin" name="signOrigin" rows="5" cols="90"><%=sSignData%></textarea></td>
						</tr>
						<tr>
							<td>서명결과</td>
							<td><textarea id="signResulttxt" name="signResulttxt" rows="20" cols="90"><%=szSignXML%></textarea></td>
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